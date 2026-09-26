import { useState, useEffect, useCallback } from 'react'
import Header from '../components/layout/Header'
import Modal from '../components/common/Modal'
import saleService from '../services/saleService'
import { formatCurrency, formatDate } from '../utils/formatters'
import { printReceipt } from '../utils/printReceipt'
import { useAuth } from '../context/AuthContext'

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const loadSales = useCallback(async () => {
    try {
      setLoading(true)
      const data = await saleService.getAll({ limit: 100 })
      setSales(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSales()
  }, [loadSales])

  const handleOpenDetail = (sale) => {
    setSelectedSale(sale)
    setIsDetailModalOpen(true)
  }

  const handleCancelSale = async (saleId) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette vente ? Le stock sera restitué.')) return
    try {
      await saleService.cancel(saleId)
      alert('Vente annulée avec succès.')
      setIsDetailModalOpen(false)
      loadSales()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de l’annulation de la vente')
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <Header
        title="Historique des Ventes"
        subtitle="Consultation des tickets émis, réimpression et annulations"
      />

      <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>N° Ticket</th>
                    <th>Date & Heure</th>
                    <th>Articles</th>
                    <th>Total Net</th>
                    <th>Paiement</th>
                    <th>Statut</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                        Aucune vente enregistrée.
                      </td>
                    </tr>
                  ) : (
                    sales.map((sale) => (
                      <tr key={sale.id}>
                        <td>
                          <strong>{sale.sale_number}</strong>
                        </td>
                        <td style={{ color: 'var(--color-text-dim)', fontSize: '12px' }}>
                          {formatDate(sale.created_at)}
                        </td>
                        <td>{sale.sale_items?.length || 0} article(s)</td>
                        <td style={{ fontWeight: 800, color: 'var(--color-accent-light)' }}>
                          {formatCurrency(sale.total)}
                        </td>
                        <td>
                          <span className="badge badge-info">{sale.payment_method}</span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              sale.status === 'COMPLETED' ? 'badge-success' : 'badge-danger'
                            }`}
                          >
                            {sale.status === 'COMPLETED' ? 'Complétée' : 'Annulée'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleOpenDetail(sale)}
                            className="btn btn-secondary btn-sm"
                            style={{ marginRight: '6px' }}
                          >
                            Détails
                          </button>
                          <button
                            onClick={() => printReceipt(sale)}
                            className="btn btn-secondary btn-sm"
                          >
                            Reçu
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sale Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Détails Vente #${selectedSale?.sale_number}`}
        maxWidth="550px"
      >
        {selectedSale && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              <span>Date: {formatDate(selectedSale.created_at)}</span>
              <span>Paiement: {selectedSale.payment_method}</span>
            </div>

            <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
              <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                Articles vendus :
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(selectedSale.sale_items || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>
                      {item.quantity}x {item.product?.name || `Produit #${item.product_id}`}
                    </span>
                    <strong>{formatCurrency(item.subtotal || item.quantity * item.unit_price)}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>Sous-total:</span>
                <span>{formatCurrency(selectedSale.subtotal)}</span>
              </div>
              {selectedSale.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)' }}>
                  <span>Remise accordée:</span>
                  <span>-{formatCurrency(selectedSale.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', paddingTop: '6px', borderTop: '1px solid var(--color-border)' }}>
                <span>Total Net:</span>
                <span style={{ color: 'var(--color-accent-light)' }}>{formatCurrency(selectedSale.total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>Montant reçu:</span>
                <span>{formatCurrency(selectedSale.amount_received)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontWeight: 600 }}>
                <span>Monnaie rendue:</span>
                <span>{formatCurrency(selectedSale.change_amount)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                onClick={() => printReceipt(selectedSale)}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Imprimer Reçu
              </button>
              {isAdmin && selectedSale.status === 'COMPLETED' && (
                <button
                  onClick={() => handleCancelSale(selectedSale.id)}
                  className="btn btn-danger"
                  style={{ justifyContent: 'center' }}
                >
                  Annuler Vente
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
