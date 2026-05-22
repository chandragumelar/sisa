import styles from './Step3MentalModel.module.css'

interface Props {
  onNext: () => void
}

export function Step3MentalModel({ onNext }: Props) {
  return (
    <>
      <div className="ob-grow" />

      <p className={styles.creed}>
        SISA <strong>bukan tracker</strong>.
        <br />
        <br />
        app jawab satu hal: <span className={styles.question}>aman ga gue beli ini sekarang?</span>
        <br />
        <br />
        Data lo <strong>di HP lo</strong>, bukan cloud.
      </p>

      <div className="ob-grow" />

      <button className="ob-primary-btn" onClick={onNext}>
        Lanjut
      </button>
      <button className="ob-skip" onClick={onNext}>
        Lewati ›
      </button>
    </>
  )
}
