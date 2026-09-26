import { useState, useMemo } from 'react'
import Modal from '../common/Modal'
import { formatCurrency } from '../../utils/formatters'

export default function PaymentModal({ isOpen, onClose, total, onConfirmSale, isSubmitting }) {
  const [amountReceived, setAmountReceived] = useState(total)
  const [notes, setNotes] = useState('')

  // Fast cash presets
  const fastAmounts = useMemo(() => {
    const base = Math.ceil(total)
    return [
      total,
      Math.ceil(base / 10) * 10,
      Math.ceil(base / 50) * 50,
      Math.ceil(base / 100) * 100,
    ].filter((v, idx, arr) => arr.indexOf(v) === idx && v >= total)
  }, [total])

  const change = useMemo(() => {
    const received = Number(amountReceived) || 0
    return Math.max(0, received - total)
  }, [amountReceived, total])

  const isValidPayment = Number(amountReceived) >= total

  const handlePay = () => {
    if (!isValidPayment) {
      alert('Le montant reçu est inférieur au total à payer.')
      return
    }
    onConfirmSale({
      payment_method: 'CASH',
      amount_received: Number(amountReceived),
      notes,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Règlement de la Vente" maxWidth="520px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Total to pay banner */}
        <div
          style={{
            background: 'var(--color-surface-2)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            border: '1px solid var(--color-border)',
          }}
        >
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Montant Total Net</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent-light)' }}>
            {formatCurrency(total)}
          </div>
        </div>

        {/* Single Payment Method (Cash Only) */}
        <div>
          <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px', display: 'block' }}>
            Mode de Paiement
          </label>
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--color-primary)',
              background: 'rgba(30,86,77,0.05)',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            <span>Espèces (Cash)</span>
          </div>
        </div>

        {/* Cash quick selection */}
        <div>
          <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>
            Montants rapides (Espèces)
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {fastAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmountReceived(amt)}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, minWidth: '70px', justifyContent: 'center', fontWeight: 600 }}
              >
                {formatCurrency(amt)}
              </button>
            ))}
          </div>
        </div>

        {/* Amount received */}
        <div>
          <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>
            Montant Encaissé (HTG)
          </label>
          <input
            type="number"
            step="0.01"
            className="input"
            value={amountReceived}
            onChange={(e) => setAmountReceived(e.target.value)}
            style={{ fontSize: '1.25rem', fontWeight: 700 }}
          />
        </div>

        {/* Change due */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: change > 0 ? 'rgba(22,163,74,0.1)' : 'var(--color-surface-2)',
            border: change > 0 ? '1px solid var(--color-success)' : '1px solid var(--color-border)',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '14px', color: change > 0 ? 'var(--color-success)' : 'var(--color-text)' }}>Monnaie à rendre :</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: change > 0 ? 'var(--color-success)' : 'var(--color-text-dim)' }}>
            {formatCurrency(change)}
          </span>
        </div>

        {/* Notes */}
        <div>
          <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px', display: 'block' }}>
            Remarques / Référence
          </label>
          <input
            type="text"
            className="input"
            placeholder="Ex: N° Transaction, Remise accordée..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: '8px' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
            Annuler
          </button>
          <button
            type="button"
            disabled={!isValidPayment || isSubmitting}
            onClick={handlePay}
            className="btn btn-success"
            style={{ flex: 2, justifyContent: 'center', fontSize: '1rem', fontWeight: 700 }}
          >
            {isSubmitting ? 'Traitement...' : 'Valider et Encaisser'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
