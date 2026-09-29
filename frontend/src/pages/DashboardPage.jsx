import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import Header from '../components/layout/Header'
import reportService from '../services/reportService'
import stockService from '../services/stockService'
import saleService from '../services/saleService'
import productService from '../services/productService'
import archiveService from '../services/archiveService'
import { formatCurrency } from '../utils/formatters'

// Pie chart colors matching the screenshot
const PIE_COLORS = ['#1e564d', '#2d8a7c', '#5ec5b5', '#a2e2d8']

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [archives, setArchives] = useState([])
  const [expandedArchiveId, setExpandedArchiveId] = useState(null)
  const [archiving, setArchiving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('today')
  const [pieFilter, setPieFilter] = useState('today')
  const [metricsPeriod, setMetricsPeriod] = useState('week')
  const navigate = useNavigate()

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const dashData = await reportService.getDashboardStats().catch(() => null)
      const prodsData = await productService.getAll({ limit: 6 }).catch(() => [])
      const lowStockData = await stockService.getLowStock().catch(() => [])
      const archivesData = await archiveService.getAll().catch(() => [])

      setStats(dashData)
      setProducts(prodsData.length ? prodsData : [])
      setLowStockItems(lowStockData || [])
      setArchives(archivesData || [])
    } catch (err) {
      console.error('Erreur chargement dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()

    // Auto-refresh every 30 seconds for real-time data
    const interval = setInterval(loadDashboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleManualArchive = async () => {
    try {
      setArchiving(true)
      await archiveService.generate()
      const updatedArchives = await archiveService.getAll()
      setArchives(updatedArchives || [])
    } catch (err) {
      console.error('Erreur lors de l’archivage:', err)
    } finally {
      setArchiving(false)
    }
  }

  // Dynamic Pie Data based on real category breakdown
  const categoryData = stats?.category_breakdown?.length > 0
    ? stats.category_breakdown.map((cat, idx) => ({
        name: cat.name,
        value: cat.value,
        color: PIE_COLORS[idx % PIE_COLORS.length],
      }))
    : [
        { name: 'Bagues Or', value: 40, color: '#1e564d' },
        { name: 'Colliers', value: 25, color: '#5ec5b5' },
        { name: 'Bracelets', value: 20, color: '#a2e2d8' },
        { name: 'Montres Luxe', value: 15, color: '#2d8a7c' },
      ]

  // Sales data based on real monthly trend
  const salesReportData = stats?.monthly_trend?.length > 0
    ? stats.monthly_trend
    : [
        { month: 'Jan', sales: 36000 },
        { month: 'Feb', sales: 40000 },
        { month: 'Mar', sales: 32000 },
        { month: 'Apr', sales: 48000 },
        { month: 'May', sales: 44000 },
        { month: 'Jun', sales: 59000 },
        { month: 'Jul', sales: 50640 },
        { month: 'Aug', sales: 52000 },
        { month: 'Sep', sales: 44000 },
        { month: 'Oct', sales: 44000 },
        { month: 'Nov', sales: 49000 },
        { month: 'Dec', sales: 42000 },
      ]

  // Custom Tooltip for Area Chart matching the screenshot dark teal pill
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: '#1e564d',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '2px' }}>
            {label} 2026
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#c8f285' }} />
            <span>Sales: {formatCurrency(payload[0].value)}</span>
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  // Period switcher for Sales & Profits: 'day' | 'week' | 'month'
  let currentSalesVal = 0
  let currentProfitsVal = 0
  let currentSalesLabel = ''
  let currentProfitsLabel = ''

  if (metricsPeriod === 'day') {
    currentSalesVal = Number(stats?.total_sales_today || stats?.today_sales_total || 0)
    currentProfitsVal = Number(stats?.profits_today || 0)
    currentSalesLabel = "Ventes d'Aujourd'hui"
    currentProfitsLabel = "Bénéfices d'Aujourd'hui"
  } else if (metricsPeriod === 'month') {
    currentSalesVal = Number(stats?.total_sales_month || 0)
    currentProfitsVal = Number(stats?.profits_month || 0)
    currentSalesLabel = "Ventes du Mois"
    currentProfitsLabel = "Bénéfices du Mois"
  } else {
    // Default: 'week'
    currentSalesVal = Number(stats?.total_sales_week || 0)
    currentProfitsVal = Number(stats?.profits_week || 0)
    currentSalesLabel = "Ventes de la Semaine"
    currentProfitsLabel = "Bénéfices de la Semaine"
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header Row */}
      <Header title="Dashboard" />

      {/* Low Stock Notification (if any) */}
      {lowStockItems.length > 0 && (
        <div
          style={{
            background: 'var(--color-warning-bg)',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-warning)' }}>
              Alerte de Stock : {lowStockItems.length} article(s) sous le seuil d'alerte.
            </span>
          </div>
          <Link to="/stock" className="btn btn-secondary btn-sm" style={{ backgroundColor: '#ffffff' }}>
            Voir le stock
          </Link>
        </div>
      )}

      {/* Metrics Period Selector: Jour / Semaine / Mois */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
          Période des Bénéfices & Ventes :
        </div>
        <div style={{ display: 'inline-flex', backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '3px', gap: '3px' }}>
          {[
            { id: 'day', label: 'Jour' },
            { id: 'week', label: 'Semaine' },
            { id: 'month', label: 'Mois' },
          ].map((tab) => {
            const isActive = metricsPeriod === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMetricsPeriod(tab.id)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? '#1e564d' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Row 1: 2 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Ventes */}
        <div
          className="card-tinted"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                {currentSalesLabel}
              </span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', marginTop: '2px' }}>
                {formatCurrency(currentSalesVal)}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Profits */}
        <div
          className="card-tinted"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                {currentProfitsLabel}
              </span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', marginTop: '2px' }}>
                {formatCurrency(currentProfitsVal)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Charts (Sales Report & Most Sales) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)',
          gap: '20px',
        }}
      >
        {/* Left: Sales Report Area Chart */}
        <div className="card" style={{ padding: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
              Sales Report
            </h3>

            <div style={{ position: 'relative' }}>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                style={{
                  appearance: 'none',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  paddingRight: '16px',
                  outline: 'none',
                }}
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette Semaine</option>
                <option value="month">Ce Mois</option>
                <option value="year">Cette Année</option>
              </select>
              <span
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  fontSize: '10px',
                  color: 'var(--color-text-muted)',
                }}
              >
                ▼
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesReportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSalesTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e564d" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1e564d" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f0" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(val) => `${val / 1000}k`}
                  domain={[10000, 60000]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#1e564d"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSalesTeal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Most Sales Donut / Pie Chart */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
              Most Sales
            </h3>

            <div style={{ position: 'relative' }}>
              <select
                value={pieFilter}
                onChange={(e) => setPieFilter(e.target.value)}
                style={{
                  appearance: 'none',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  paddingRight: '16px',
                  outline: 'none',
                }}
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette Semaine</option>
                <option value="month">Ce Mois</option>
                <option value="year">Cette Année</option>
              </select>
              <span
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  fontSize: '10px',
                  color: 'var(--color-text-muted)',
                }}
              >
                ▼
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: 160, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '10px',
            }}
          >
            {categoryData.map((item, idx) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                    display: 'inline-block',
                  }}
                />
                <span>{item.name} {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Product Sales Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            Product Sales
          </h3>

          <Link
            to="/products"
            className="btn btn-secondary btn-sm"
            style={{
              backgroundColor: 'var(--color-surface-3)',
              color: 'var(--color-primary)',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontWeight: 600,
            }}
          >
            Add Product
          </Link>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Product ID / SKU</th>
                <th>Product Description</th>
                <th>Product Type</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    <div style={{ fontWeight: 600 }}>Catalogue actuellement vide (0 bijou).</div>
                    <small>Cliquez sur "+ Add Product" pour ajouter vos propres articles.</small>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isStockUnder5 = (p.stock_quantity ?? 0) < 5
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                        {p.name}
                      </td>
                      <td style={{ color: 'var(--color-primary)', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600 }}>
                        {p.sku || `#${p.id}`}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                        {p.description || 'Bijou de collection'}
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ fontSize: '11px', background: '#eef5f3', color: '#1e564d' }}>
                          {p.category?.name || 'Joaillerie'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--color-text)' }}>
                        {formatCurrency(p.selling_price ?? p.price)}
                      </td>
                      <td>
                        {isStockUnder5 ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: 800,
                              backgroundColor: '#ffe4e6',
                              color: '#e11d48',
                              border: '1px solid #fecdd3',
                            }}
                          >
                            ⚠️ {p.stock_quantity ?? 0}
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            {p.stock_quantity}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Link
                          to="/products"
                          style={{
                            fontSize: '12px',
                            color: 'var(--color-text-muted)',
                            marginRight: '8px',
                            textDecoration: 'none',
                          }}
                        >
                          Edit
                        </Link>
                        <span style={{ color: 'var(--color-border)', marginRight: '8px' }}>·</span>
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Supprimer ${p.name} ?`)) return
                            try {
                              await productService.delete(p.id)
                              setProducts((prev) => prev.filter((item) => item.id !== p.id))
                            } catch (e) {
                              alert('Erreur lors de la suppression')
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '12px',
                            color: 'var(--color-danger)',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Archives Mensuelles System */}
      <div className="card" style={{ padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
              Archives Mensuelles
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
              Bilans mensuels conservés (à partir d'Août 2026). Les statistiques restent préservées.
            </p>
          </div>

          <button
            onClick={handleManualArchive}
            disabled={archiving}
            className="btn btn-primary btn-sm"
            style={{
              backgroundColor: '#1e564d',
              color: '#ffffff',
              borderRadius: '9999px',
              padding: '8px 18px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: archiving ? 'not-allowed' : 'pointer',
              opacity: archiving ? 0.7 : 1,
            }}
          >
            {archiving ? (
              <>Archivage en cours...</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 8v13H3V8" />
                  <path d="M1 3h22v5H1z" />
                  <path d="M10 12h4" />
                </svg>
                Archiver le Mois En Cours
              </>
            )}
          </button>
        </div>

        {archives.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
            Aucune archive enregistrée pour le moment.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {archives.map((arch) => {
              const isExpanded = expandedArchiveId === arch.id
              return (
                <div
                  key={arch.id}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Card Header Row */}
                  <div
                    onClick={() => setExpandedArchiveId(isExpanded ? null : arch.id)}
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      backgroundColor: isExpanded ? '#f8faf9' : '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#eef5f3',
                          color: '#1e564d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '14px',
                        }}
                      >
                        📅
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                          {arch.month_name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          Archivé le {arch.archived_at ? new Date(arch.archived_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Chiffre d'Affaires</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e564d' }}>
                          {formatCurrency(arch.total_sales)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }} className="hide-mobile">
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Bénéfices</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>
                          {formatCurrency(arch.total_profit)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }} className="hide-mobile">
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Transactions</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                          {arch.transaction_count}
                        </div>
                      </div>
                      <div style={{ fontSize: '16px', color: 'var(--color-text-muted)' }}>
                        {isExpanded ? '▲' : '▼'}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details Body */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '16px 20px 20px 20px',
                        borderTop: '1px solid var(--color-border)',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                          gap: '12px',
                        }}
                      >
                        <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f8faf9' }}>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Total Ventes</span>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                            {formatCurrency(arch.total_sales)}
                          </div>
                        </div>
                        <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f8faf9' }}>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Total Encaissé</span>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                            {formatCurrency(arch.total_paid)}
                          </div>
                        </div>
                        <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f8faf9' }}>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Bénéfices Estimés</span>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>
                            {formatCurrency(arch.total_profit)}
                          </div>
                        </div>
                        <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f8faf9' }}>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Transactions</span>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                            {arch.transaction_count} vente(s)
                          </div>
                        </div>
                        <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f8faf9' }}>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Bijoux Vendus</span>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                            {arch.products_sold} article(s)
                          </div>
                        </div>
                      </div>

                      {/* Category Breakdown list if available */}
                      {arch.category_breakdown && arch.category_breakdown.length > 0 && (
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text)' }}>
                            Répartition par catégorie ce mois-ci :
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {arch.category_breakdown.map((c) => (
                              <span
                                key={c.name}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '9999px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  backgroundColor: '#eef5f3',
                                  color: '#1e564d',
                                }}
                              >
                                {c.name} : {c.value} vendus
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
