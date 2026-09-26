import Modal from '../common/Modal'
import { printReceipt } from '../../utils/printReceipt'
import { formatCurrency, formatDate } from '../../utils/formatters'

export default function ReceiptModal({ isOpen, onClose, sale }) {
  if (!sale) return null

  const handlePrint = () => {
    printReceipt(sale)
  }

  const items = sale.items || sale.sale_items || []

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vente Enregistrée avec Succès !" maxWidth="450px">
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px', color: '#1e293b' }}>
          Vente N° {sale.sale_number}
        </h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: '#64748b', marginBottom: '16px' }}>
          {formatDate(sale.created_at)}
        </p>

        {/* Liste des produits avec juste le nom du produit */}
        {items.length > 0 && (
          <div
            style={{
              background: '#f8fafc',
              padding: '12px 16px',
              borderRadius: '14px',
              textAlign: 'left',
              marginBottom: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
              Articles ({items.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>
                    {item.product_name || item.name || item.product?.name || `Produit #${item.product_id}`}
                    {item.quantity > 1 ? ` (x${item.quantity})` : ''}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {formatCurrency(item.subtotal || item.total_price || (item.quantity * item.unit_price))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Résumé de paiement style screenshot */}
        <div
          style={{
            background: '#f8fafc',
            padding: '16px',
            borderRadius: '14px',
            textAlign: 'left',
            marginBottom: '20px',
            border: '1px solid #e2e8f0',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>Total Vente:</span>
            <strong style={{ color: '#1e564d', fontSize: '14px' }}>{formatCurrency(sale.total)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>Montant Reçu:</span>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatCurrency(sale.amount_received)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>Monnaie Rendue:</span>
            <strong style={{ color: '#16a34a', fontSize: '14px' }}>{formatCurrency(sale.change_amount)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>Paiement:</span>
            <span
              style={{
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                padding: '3px 12px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: '0.05em',
              }}
            >
              {sale.payment_method || 'CASH'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handlePrint}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', fontSize: '15px' }}
          >
            Imprimer Reçu Ticket
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Nouvelle Vente
          </button>
        </div>
      </div>
    </Modal>
  )
}
