import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TagihanRow {
  anonymous_id: string
  tagihan_local_id: number
  name: string
  due_day: number
  frequency: string
  anchor_date: number // epoch ms
  last_paid_at: number | null // epoch ms
  is_active: boolean
  last_notified_period: string | null
}

interface SubscriptionRow {
  anonymous_id: string
  endpoint: string
  subscription: webpush.PushSubscription
}

// ---------------------------------------------------------------------------
// Date helpers (WIB = UTC+7)
// ---------------------------------------------------------------------------

function wibNow(): Date {
  return new Date(Date.now() + 7 * 3_600_000)
}

/** Days in a month (1-indexed month). */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * Clamp due_day to the last valid day of the given month.
 * month is 1-indexed (Jan=1).
 */
function effectiveDueDay(dueDay: number, year: number, month: number): number {
  return Math.min(dueDay, daysInMonth(year, month))
}

/**
 * True if this month is a due month for multi-month cadences.
 * anchorMs: anchor_date epoch ms (WIB evaluated)
 * cadenceMonths: 2 | 3 | 12
 */
function isDueMonth(anchorMs: number, cadenceMonths: number, year: number, month: number): boolean {
  const anchor = new Date(anchorMs + 7 * 3_600_000) // shift to WIB
  const anchorYear = anchor.getUTCFullYear()
  const anchorMonth = anchor.getUTCMonth() + 1 // 1-indexed
  const totalMonthsFromAnchor = (year - anchorYear) * 12 + (month - anchorMonth)
  return totalMonthsFromAnchor % cadenceMonths === 0
}

/**
 * Start of the current billing period (epoch ms WIB).
 * For monthly cadences: the last passed due-date in WIB.
 */
function periodStartMs(
  dueDay: number,
  frequency: string,
  anchorMs: number,
  nowWib: Date,
): number | null {
  const year = nowWib.getUTCFullYear()
  const month = nowWib.getUTCMonth() + 1
  const day = nowWib.getUTCDate()
  const effDay = effectiveDueDay(dueDay, year, month)

  let periodYear = year
  let periodMonth = month
  if (day < effDay) {
    // due day hasn't arrived yet this month → previous month's due date is the period start
    periodMonth = month - 1
    if (periodMonth === 0) {
      periodMonth = 12
      periodYear--
    }
  }

  // For cadence frequencies, verify the resolved month is actually a due month
  const cadence = cadenceFor(frequency)
  if (cadence !== null && !isDueMonth(anchorMs, cadence, periodYear, periodMonth)) {
    // Walk back until we find the most recent due month
    for (let i = 0; i < 24; i++) {
      periodMonth--
      if (periodMonth === 0) {
        periodMonth = 12
        periodYear--
      }
      if (isDueMonth(anchorMs, cadence, periodYear, periodMonth)) break
    }
  }

  const effDayForPeriod = effectiveDueDay(dueDay, periodYear, periodMonth)
  // Return as epoch ms (Date treats year/month/day as local — use UTC + WIB offset cancel)
  return Date.UTC(periodYear, periodMonth - 1, effDayForPeriod) - 7 * 3_600_000
}

function cadenceFor(frequency: string): number | null {
  if (frequency === '2bulanan') return 2
  if (frequency === '3bulanan') return 3
  if (frequency === 'tahunan') return 12
  return null
}

// ---------------------------------------------------------------------------
// Due check: returns 'today' | 'yesterday' | null
// ---------------------------------------------------------------------------

function getDueStatus(row: TagihanRow, nowWib: Date): 'today' | 'yesterday' | null {
  const freq = row.frequency

  // TODO: handle mingguan / 2mingguan (weekly cadence — no due_day concept; skip for now)
  if (freq === 'mingguan' || freq === '2mingguan') return null

  const year = nowWib.getUTCFullYear()
  const month = nowWib.getUTCMonth() + 1
  const day = nowWib.getUTCDate()

  // yesterday in WIB
  const yWib = new Date(nowWib.getTime() - 86_400_000)
  const yYear = yWib.getUTCFullYear()
  const yMonth = yWib.getUTCMonth() + 1
  const yDay = yWib.getUTCDate()

  const effToday = effectiveDueDay(row.due_day, year, month)
  const effYesterday = effectiveDueDay(row.due_day, yYear, yMonth)

  const dueToday = effToday === day
  const dueYesterday = effYesterday === yDay

  if (!dueToday && !dueYesterday) return null

  // Cadence check for multi-month frequencies
  const cadence = cadenceFor(freq)
  if (cadence !== null) {
    const targetYear = dueToday ? year : yYear
    const targetMonth = dueToday ? month : yMonth
    if (!isDueMonth(row.anchor_date, cadence, targetYear, targetMonth)) return null
  }

  // Already paid this period?
  if (row.last_paid_at !== null) {
    const pStart = periodStartMs(row.due_day, freq, row.anchor_date, nowWib)
    if (pStart !== null && row.last_paid_at >= pStart) return null
  }

  return dueToday ? 'today' : 'yesterday'
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) {
    return new Response('forbidden', { status: 403 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  webpush.setVapidDetails(
    'mailto:hello@sisa.app',
    Deno.env.get('VAPID_PUBLIC_KEY')!,
    Deno.env.get('VAPID_PRIVATE_KEY')!,
  )

  const nowWib = wibNow()
  const period = `${nowWib.getUTCFullYear()}-${String(nowWib.getUTCMonth() + 1).padStart(2, '0')}`

  // Fetch active tagihan not yet notified this period
  const { data: candidates, error: fetchErr } = await supabase
    .from('tagihan_reminder')
    .select('*')
    .eq('is_active', true)
    .or(`last_notified_period.is.null,last_notified_period.neq.${period}`)

  if (fetchErr) {
    return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500 })
  }

  const rows = (candidates ?? []) as TagihanRow[]

  let sent = 0
  let failed = 0
  let skipped = 0

  // Group by anonymous_id to batch subscription lookups
  const byUser = new Map<string, TagihanRow[]>()
  for (const row of rows) {
    const status = getDueStatus(row, nowWib)
    if (!status) {
      skipped++
      continue
    }
    const list = byUser.get(row.anonymous_id) ?? []
    list.push({ ...row, _status: status } as TagihanRow & { _status: string })
    byUser.set(row.anonymous_id, list)
  }

  const chunks = [...byUser.entries()]
  const CHUNK = 100

  for (let i = 0; i < chunks.length; i += CHUNK) {
    const slice = chunks.slice(i, i + CHUNK)
    await Promise.allSettled(
      slice.map(async ([anonId, tagihans]) => {
        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('anonymous_id', anonId)

        if (!subs || subs.length === 0) {
          skipped += tagihans.length
          return
        }

        const subscriptions = subs as SubscriptionRow[]

        await Promise.allSettled(
          tagihans.map(async (row) => {
            const status = (row as TagihanRow & { _status: string })._status
            const body =
              status === 'today'
                ? `"${row.name}" jatuh tempo hari ini.`
                : `"${row.name}" lewat jatuh tempo kemarin.`

            const payload = JSON.stringify({
              title: 'SISA',
              body,
              tag: `tagihan-${row.tagihan_local_id}`,
              url: '/',
            })

            const results = await Promise.allSettled(
              subscriptions.map(async (sub) => {
                try {
                  await webpush.sendNotification(sub.subscription, payload)
                } catch (err: unknown) {
                  const status = (err as { statusCode?: number }).statusCode
                  if (status === 404 || status === 410) {
                    // Expired subscription — remove it
                    await supabase
                      .from('push_subscriptions')
                      .delete()
                      .eq('anonymous_id', anonId)
                      .eq('endpoint', sub.endpoint)
                  }
                  throw err
                }
              }),
            )

            const anySuccess = results.some((r) => r.status === 'fulfilled')
            if (anySuccess) {
              await supabase
                .from('tagihan_reminder')
                .update({ last_notified_period: period })
                .eq('anonymous_id', anonId)
                .eq('tagihan_local_id', row.tagihan_local_id)
              sent++
            } else {
              failed++
            }
          }),
        )
      }),
    )
  }

  return new Response(JSON.stringify({ sent, failed, skipped, period }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
