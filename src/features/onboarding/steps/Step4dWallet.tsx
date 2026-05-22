import type { WalletInput } from '../onboarding.types'

interface Props {
  primaryCurrency: string
  wallets: WalletInput[]
  onChange: (wallets: WalletInput[]) => void
  onNext: () => void
}

export function Step4dWallet({ primaryCurrency, wallets, onChange, onNext }: Props) {
  function updateWallet(index: number, field: keyof WalletInput, value: string) {
    const next = wallets.map((w, i) => (i === index ? { ...w, [field]: value } : w))
    onChange(next)
  }

  function addWallet() {
    onChange([...wallets, { name: '', balance: '' }])
  }

  function removeWallet(index: number) {
    onChange(wallets.filter((_, i) => i !== index))
  }

  const canProceed = wallets.length > 0 && wallets[0].name.trim() !== ''

  return (
    <>
      <h1 className="ob-heading">Dompet lo</h1>
      <p className="ob-subheading">
        Tambah rekening, dompet tunai, atau e-wallet. Saldo bisa diisi nanti.
      </p>

      {wallets.map((wallet, i) => (
        <div key={i} className="ob-field">
          {i > 0 && <div className="ob-field-label">Dompet {i + 1}</div>}
          <div className="ob-input-row">
            <input
              className="ob-input ob-input-bare"
              type="text"
              placeholder={i === 0 ? 'Nama dompet (cth: BCA, GoPay)' : 'Nama dompet'}
              value={wallet.name}
              onChange={(e) => updateWallet(i, 'name', e.target.value)}
              autoComplete="off"
            />
            {i > 0 && (
              <button
                className="ob-ghost-btn"
                onClick={() => removeWallet(i)}
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
              type="number"
              inputMode="numeric"
              placeholder="Saldo sekarang (opsional)"
              min={0}
              value={wallet.balance}
              onChange={(e) => updateWallet(i, 'balance', e.target.value)}
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
