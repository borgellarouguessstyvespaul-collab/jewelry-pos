import { useState, useEffect, useCallback, useMemo } from 'react'
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
  const [successMsg, setSuccessMsg] = useState('')
  const [archivedDays, setArchivedDays] = useState({})
  const [expandedDays, setExpandedDays] = useState({})

  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3500)
  }

  const loadSales = useCallback(async () => {
    try {
      setLoading(true)
      const data = await saleService.getAll({ limit: 200 })
      setSales(data || [])
      
      // Louvri jounen jodi a pa defo
      if (data && data.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0]
        setExpandedDays(prev => ({ ...prev, [todayStr]: true }))
      }
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
    if (!window.confirm('Voulez-vous vraiment annuler cette vente ? Le montant sera déduit et le stock restitué.')) return
    try {
      await saleService.cancel(saleId)
      showSuccess('Vente annulée avec succès. Dashboard et stocks mis à jour.')
      setIsDetailModalOpen(false)
      loadSales()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de l’annulation de la vente')
    }
  }

  // Gwoupe lavant yo pa dat ak kalkil pwofi an tan reyèl
  const salesByDay = useMemo(() => {
    const groups = {}
    sales.forEach(sale => {
      const dateObj = new Date(sale.created_at || Date.now())
      const dayKey = dateObj.toISOString().split('T')[0] // Fòma YYYY-MM-DD
      
      if (!groups[dayKey]) {
        groups[dayKey] = {
          dateStr: dayKey,
          formattedDate: dateObj.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          items: [],
          totalAmount: 0,
          totalProfit: 0,
          completedCount: 0
        }
      }
      
      groups[dayKey].items.push(sale)
      
      if (sale.status === 'COMPLETED') {
        groups[dayKey].totalAmount += Number(sale.total || 0)
        groups[dayKey].completedCount += 1

        // Kalkil pwofi reyèl pou chak atik nan vant sa a
        const saleProfit = (sale.sale_items || []).reduce((itemAcc, item) => {
          const prixVente = Number(item.unit_price || item.price || 0)
          const prixAchat = Number(item.cost_price || item.purchase_price || item.product?.cost_price || item.product?.purchase_price || 0)
          const quantite = Number(item.quantity || 0)
          return itemAcc + ((prixVente - prixAchat) * quantite)
        }, 0)

        groups[dayKey].totalProfit += saleProfit
      }
    })

    // Triye depi pi resan an pou ale nan pi ansyen an
    return Object.values(groups).sort((a, b) => b.dateStr.localeCompare(a.dateStr))
  }, [sales])

  // Kalkil pwofi pou sèl yon sèl vant chwazi (pou modal detay yo)
  const selectedSaleProfit = useMemo(() => {
    if (!selectedSale || !selectedSale.sale_items) return 0
    return selectedSale.sale_items.reduce((itemAcc, item) => {
      const prixVente = Number(item.unit_price || item.price || 0)
      const prixAchat = Number(item.cost_price || item.purchase_price || item.product?.cost_price || item.product?.purchase_price || 0)
      const quantite = Number(item.quantity || 0)
      return itemAcc + ((prixVente - prixAchat) * quantite)
    }, 0)
  }, [selectedSale])

  const toggleDay = (dayKey) => {
    setExpandedDays(prev => ({ ...prev, [dayKey]: !prev[dayKey] }))
  }

  const toggleArchiveDay = (dayKey, e) => {
    e.stopPropagation()
    setArchivedDays(prev => {
      const newState = { ...prev, [dayKey]: !prev[dayKey] }
      return newState
    })
    showSuccess(archivedDays[dayKey] ? `Journée ${dayKey} désarchivée.` : `Journée ${dayKey} archivée avec succès !`)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <Header
        title="Historique des Ventes par Jour & Bénéfices"
        subtitle="Suivi des transactions journalières, ventilation par jour et calcul des profits en temps réel"
      />

      {successMsg && (
        <div
          style={{
            margin: 'var(--space-4) var(--space-6) 0',
            padding: '12px 18px',
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: 'var(--radius-lg)',
            color: '#166534',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          {successMsg}
        </div>
      )}

      <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {loading ? (
          <div className="card" style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="spinner"></div>
          </div>
        ) : salesByDay.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Aucune vente enregistrée pour le moment.
          </div>
        ) : (
          salesByDay.map((group) => {
            const isOpen = !!expandedDays[group.dateStr]
            const isArchived = !!archivedDays[group.dateStr]

            return (
              <div
                key={group.dateStr}
                className="card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  border: isArchived ? '1px dashed #cbd5e1' : '1px solid var(--color-border)',
                  opacity: isArchived ? 0.85 : 1
                }}
              >
                {/* Antèt Jounen an ak Total Ventes & Bénéfice */}
                <div
                  onClick={() => toggleDay(group.dateStr)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-5 sm:py-3.5 cursor-pointer select-none transition-colors"
                  style={{
                    backgroundColor: isOpen ? '#f0f9f6' : 'var(--color-surface)',
                    borderBottom: isOpen ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '14px', color: '#1e564d', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      ▶
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text)', textTransform: 'capitalize' }}>
                          {group.formattedDate}
                        </span>
                        <span className="badge badge-info" style={{ fontSize: '11px' }}>
                          {group.completedCount} vente(s)
                        </span>
                        {isArchived && (
                          <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, backgroundColor: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db' }}>
                            Archivé 📦
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <span>Total Ventes: <strong style={{ color: '#1e564d' }}>{formatCurrency(group.totalAmount)}</strong></span>
                        <span>Bénéfice (Pwofi): <strong style={{ color: '#16a34a' }}>{formatCurrency(group.totalProfit)}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => toggleArchiveDay(group.dateStr, e)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '12px' }}
                    >
                      {isArchived ? 'Désarchiver' : '📦 Archiver la Journée'}
                    </button>
                  </div>
                </div>

                {/* Lis Vant pou Jounen sa a */}
                {isOpen && (
                  <div style={{ animation: 'fadeIn 0.2s ease' }}>
                    <div className="table-wrapper overflow-x-auto">
                      <table style={{ width: '100%', minWidth: '750px', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f9fafb' }}>
                            <th>N° Ticket</th>
                            <th>Heure</th>
                            <th>Articles</th>
                            <th>Total Net</th>
                            <th>Paiement</th>
                            <th>Statut</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map((sale) => (
                            <tr key={sale.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                              <td>
                                <strong style={{ color: '#1e564d' }}>{sale.sale_number}</strong>
                              </td>
                              <td style={{ color: 'var(--color-text-dim)', fontSize: '12px' }}>
                                {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td>{sale.sale_items?.length || 0} article(s)</td>
                              <td style={{ fontWeight: 800, color: 'var(--color-accent-light)' }}>
                                {formatCurrency(sale.total)}
                              </td>
                              <td>
                                <span className="badge badge-info" style={{ fontSize: '11px' }}>{sale.payment_method}</span>
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    sale.status === 'COMPLETED' ? 'badge-success' : 'badge-danger'
                                  }`}
                                  style={{ fontSize: '11px' }}
                                >
                                  {sale.status === 'COMPLETED' ? 'Complétée' : 'Annulée'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => handleOpenDetail(sale)}
                                    className="btn btn-secondary btn-sm"
                                    style={{ fontSize: '12px' }}
                                  >
                                    Détails
                                  </button>
                                  <button
                                    onClick={() => printReceipt(sale)}
                                    className="btn btn-secondary btn-sm"
                                    style={{ fontSize: '12px' }}
                                  >
                                    Reçu
                                  </button>
                                  {isAdmin && sale.status === 'COMPLETED' && (
                                    <button
                                      onClick={() => handleCancelSale(sale.id)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ fontSize: '12px', color: 'var(--color-danger)', borderColor: '#fecdd3' }}
                                    >
                                      Anile
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Modal Detay Vant */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Détails Vente #${selectedSale?.sale_number || ''}`}
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
              
              {/* Afichaj Pwofi pou ticket sa a an patikilye */}
              {isAdmin && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 700, paddingTop: '4px' }}>
                  <span>Bénéfice (Pwofi Vye sa a):</span>
                  <span>{formatCurrency(selectedSaleProfit)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', paddingTop: '4px' }}>
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