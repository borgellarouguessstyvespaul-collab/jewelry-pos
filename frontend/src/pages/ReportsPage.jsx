import { useState, useEffect, useCallback } from 'react'
import Header from '../components/layout/Header'
import reportService from '../services/reportService'
import { formatCurrency } from '../utils/formatters'

export default function ReportsPage() {
  const [period, setPeriod] = useState('daily')
  const [salesReport, setSalesReport] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [stockReport, setStockReport] = useState([])
  const [loading, setLoading] = useState(true)

  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      const [salesData, topData, stockData] = await Promise.all([
        reportService.getSalesReport({ period }).catch(() => null),
        reportService.getTopProducts(10).catch(() => ({ top_products: [] })),
        reportService.getStockReport().catch(() => []),
      ])
      setSalesReport(salesData)
      setTopProducts(topData?.top_products || [])
      setStockReport(stockData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  // Calculate stock total valuation
  const totalStockValue = stockReport.reduce(
    (sum, item) => sum + (Number(item.retail_value) || (Number(item.price) * Number(item.stock_quantity)) || 0),
    0
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <Header
        title="Rapports Financiers & Statistiques"
        subtitle="Analyses des ventes quotidiennes, hebdomadaires, mensuelles et valorisation d'inventaire"
      />

      <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Period toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setPeriod('daily')}
            className={`btn btn-sm ${period === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Aujourd'hui (Quotidien)
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`btn btn-sm ${period === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Cette Semaine (Hebdomadaire)
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`btn btn-sm ${period === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Ce Mois (Mensuel)
          </button>
        </div>

        {/* Report Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="card">
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Chiffre d'Affaires</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '6px 0 0', color: 'var(--color-accent-light)' }}>
              {formatCurrency(salesReport?.total || 0)}
            </h3>
          </div>

          <div className="card">
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Nombre de Transactions</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '6px 0 0' }}>
              {salesReport?.count || 0}
            </h3>
          </div>

          <div className="card">
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Panier Moyen</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '6px 0 0' }}>
              {salesReport?.count > 0
                ? formatCurrency((salesReport.total || 0) / salesReport.count)
                : '$0.00'}
            </h3>
          </div>

          <div className="card">
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Valorisation du Stock</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '6px 0 0', color: 'var(--color-success)' }}>
              {formatCurrency(totalStockValue)}
            </h3>
          </div>
        </div>

        {/* Two-columns: Top Products & Stock Valuation Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
              les Plus Rentables
            </h3>
            {topProducts.length === 0 ? (
              <p style={{ fontSize: '13px' }}>Aucune donnée de vente pour cette période.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>produit</th>
                      <th>Qté Vendue</th>
                      <th style={{ textAlign: 'right' }}>Revenu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={i}>
                        <td>
                          <strong>{p.product_name}</strong>
                        </td>
                        <td>{p.quantity_sold}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-accent-light)' }}>
                          {formatCurrency(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
              Inventaire & Valorisation par Article
            </h3>
            {stockReport.length === 0 ? (
              <p style={{ fontSize: '13px' }}>Aucune donnée de stock disponible.</p>
            ) : (
              <div className="table-wrapper" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th>Stock</th>
                      <th style={{ textAlign: 'right' }}>Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockReport.map((s, idx) => (
                      <tr key={idx}>
                        <td>{s.product_name}</td>
                        <td>{s.current_stock || s.stock_quantity}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          {formatCurrency(s.retail_value || (Number(s.price) * Number(s.current_stock || s.stock_quantity)) || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
