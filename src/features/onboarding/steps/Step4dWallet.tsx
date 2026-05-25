import type { Language } from '@/db/database'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import type { WalletInput } from '../onboarding.types'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'

interface Props {
  primaryCurrency: string
  language: Language | null
  wallets: WalletInput[]
  onChange: (wallets: WalletInput[]) => void
  onNext: () => void
}

export function Step4dWallet({ primaryCurrency, wallets, onChange, onNext }: Props) {
  const lang = useLanguage()

  function updateWalletName(id: string, name: string) {
    onChange(wallets.map((w) => (w.id === id ? { ...w, name } : w)))
  }

  function updateWalletBalance(id: string, display: string) {
    const balance = parseNominalRaw(display)
    onChange(wallets.map((w) => (w.id === id ? { ...w, balance } : w)))
  }

  function addWallet() {
    onChange([...wallets, { id: crypto.randomUUID(), name: '', balance: '' }])
  }

  function removeWallet(id: string) {
    onChange(wallets.filter((w) => w.id !== id))
  }

  const canProceed = wallets.length > 0 && wallets[0].name.trim() !== ''

  return (
    <>
      <h1 className="ob-heading">{t('ob.step4d.heading', lang)}</h1>
      <p className="ob-subheading">{t('ob.step4d.sub', lang)}</p>

      {wallets.map((wallet, i) => (
        <div key={wallet.id} className="ob-field">
          {i > 0 && (
            <div className="ob-field-label">
              {t('ob.step4d.wallet_label', lang).replace('{n}', String(i + 1))}
            </div>
          )}
          <div className="ob-input-row">
            <input
              className="ob-input ob-input-bare"
              type="text"
              placeholder={
                i === 0
                  ? t('ob.step4d.placeholder_first', lang)
                  : t('ob.step4d.placeholder_other', lang)
              }
              value={wallet.name}
              onChange={(e) => updateWalletName(wallet.id, e.target.value)}
              autoComplete="off"
            />
            {i > 0 && (
              <button
                className="ob-remove-btn"
                onClick={() => removeWallet(wallet.id)}
                aria-label={t('ob.step4d.remove_aria', lang)}
              >
                ✕
              </button>
            )}
          </div>
          <div className="ob-input-row">
            <span className="ob-input-prefix">{primaryCurrency}</span>
            <input
              className="ob-input ob-input-bare"
              type="text"
              inputMode="numeric"
              placeholder={t('ob.step4d.balance_label', lang)}
              value={formatNominalDisplay(wallet.balance)}
              onChange={(e) => updateWalletBalance(wallet.id, e.target.value)}
            />
          </div>
        </div>
      ))}

      <button className="ob-add-line" onClick={addWallet}>
        {t('ob.step4d.add_more', lang)}
      </button>

      <div className="ob-grow" />

      <button className="ob-primary-btn" disabled={!canProceed} onClick={onNext}>
        {t('ob.step4d.next', lang)}
      </button>
    </>
  )
}
