import type { Language } from '@/db/database'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import type { WalletInput } from '../onboarding.types'

interface Props {
  primaryCurrency: string
  language: Language | null
  wallets: WalletInput[]
  onChange: (wallets: WalletInput[]) => void
  onNext: () => void
}

export function Step4dWallet({ primaryCurrency, language, wallets, onChange, onNext }: Props) {
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

  const firstPlaceholder =
    language === 'en'
      ? 'Wallet name (e.g. Standard Chartered, Wise)'
      : 'Nama dompet (cth: BCA, GoPay)'
  const otherPlaceholder = language === 'en' ? 'Wallet name' : 'Nama dompet'

  return (
    <>
      <h1 className="ob-heading">Dompet lo</h1>
      <p className="ob-subheading">
        Tambah rekening, dompet tunai, atau e-wallet. Saldo bisa diisi nanti.
      </p>

      {wallets.map((wallet, i) => (
        <div key={wallet.id} className="ob-field">
          {i > 0 && <div className="ob-field-label">Dompet {i + 1}</div>}
          <div className="ob-input-row">
            <input
              className="ob-input ob-input-bare"
              type="text"
              placeholder={i === 0 ? firstPlaceholder : otherPlaceholder}
              value={wallet.name}
              onChange={(e) => updateWalletName(wallet.id, e.target.value)}
              autoComplete="off"
            />
            {i > 0 && (
              <button
                className="ob-remove-btn"
                onClick={() => removeWallet(wallet.id)}
                aria-label="Hapus dompet"
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
              placeholder="Saldo sekarang (opsional)"
              value={formatNominalDisplay(wallet.balance)}
              onChange={(e) => updateWalletBalance(wallet.id, e.target.value)}
            />
          </div>
        </div>
      ))}

      <button className="ob-add-line" onClick={addWallet}>
        + Tambah dompet lain
      </button>

      <div className="ob-grow" />

      <button className="ob-primary-btn" disabled={!canProceed} onClick={onNext}>
        Lanjut
      </button>
    </>
  )
}
