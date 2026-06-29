import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(403).json({ error: 'forbidden' })
  }

  const upstream = await fetch(`${process.env.SUPABASE_FUNC_URL}/send-tagihan-push`, {
    method: 'POST',
    headers: { 'x-cron-secret': process.env.CRON_SECRET! },
  })

  const body = await upstream.json()
  return res.status(200).json({ ok: true, upstream: upstream.status, ...body })
}
