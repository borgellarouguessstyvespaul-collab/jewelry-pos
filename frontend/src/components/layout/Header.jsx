import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import stockService from '../../services/stockService'
import auditService from '../../services/auditService'
import { formatDate } from '../../utils/formatters'

export default function Header({ title = 'Dashboard', subtitle, actions }) {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [lowStockItems, setLowStockItems] = useState([])
  const [securityNotifs, setSecurityNotifs] = useState([])
  const [currentTime, setCurrentTime] = useState('')
  const [notificationsCleared, setNotificationsCleared] = useState(false)
  const dropdownRef = useRef(null)
  const notifRef = useRef(null)
  const navigate = useNavigate()

  const isAdmin = user?.role === 'ADMIN'

  // Live clock interval (hours & minutes)
  useEffect(() => {
    const updateTime = () => {
      const d = new Date()
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      setCurrentTime(`${h}:${m}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Load low stock & security notifications
  useEffect(() => {
    stockService.getLowStock().then((data) => setLowStockItems(data || [])).catch(() => {})
    if (isAdmin) {
      auditService.getAll({ action: 'PASSWORD_CHANGED', limit: 10 })
        .then((data) => setSecurityNotifs(data || []))
        .catch(() => {})
    }
  }, [user, isAdmin])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Display name & role formatted cleanly
  const displayName = user?.full_name || user?.name || 'Admin'
  const displayRole = user?.role === 'ADMIN' ? 'Admin Manager' : user?.role === 'GESTIONNAIRE' ? 'Store Manager' : 'Cashier'

  const currentHour = new Date().getHours()
  const isBusinessHours = currentHour >= 8 && currentHour < 18

  let isRestrictionDisabled = false
  try {
    const saved = localStorage.getItem('kisa_boutique_settings')
    if (saved) {
      isRestrictionDisabled = !!JSON.parse(saved).disableBusinessHoursRestriction
    }
  } catch {}

  const totalNotifs = notificationsCleared ? 0 : (lowStockItems.length + (isAdmin ? securityNotifs.length : 0))
  const hasNewNotifs = totalNotifs > 0

  const handleClearNotifications = (e) => {
    e.stopPropagation()
    setNotificationsCleared(true)
    setLowStockItems([])
    setSecurityNotifs([])
    setNotifOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
      {/* CSS Animation pou Kloch la (Souke yon sèl fwa sèlman: 1) */}
      <style>{`
        @keyframes shake {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-15deg); }
          60% { transform: rotate(10deg); }
          80% { transform: rotate(-10deg); }
          100% { transform: rotate(0deg); }
        }
        .bell-shake {
          animation: shake 0.5s ease-in-out 1;
          display: inline-block;
        }
      `}</style>

      {/* Top Navbar Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 0',
        }}
      >
        {/* Live Clock & Operating Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--color-primary-dark)' }}>
              {currentTime}
            </span>
            <span
              className={`badge ${isRestrictionDisabled ? 'badge-warning' : isBusinessHours ? 'badge-success' : 'badge-danger'}`}
              style={{ fontSize: '11px', fontWeight: 700 }}
            >
              {isRestrictionDisabled
                ? 'Mode Urgence (Accès 24/7)'
                : isBusinessHours
                ? 'Magasin Ouvert (8h - 18h)'
                : 'Système Fermé (Hors heures)'}
            </span>
          </div>
        </div>

        {/* Right tools: Notifications & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Notification bell & Clear Cross */}
          <div ref={notifRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              title="Notifications"
              style={{
                position: 'relative',
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
                transition: 'background-color var(--transition-fast)',
              }}
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <span className={hasNewNotifs ? 'bell-shake' : ''} style={{ fontSize: '16px' }}>
                🔔
              </span>
              {totalNotifs > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    minWidth: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-danger)',
                    border: '1.5px solid #fff',
                  }}
                />
              )}
            </button>

            {/* Ti kwa bo kotel pou efase notifikasyon yo */}
            {totalNotifs > 0 && (
              <button
                type="button"
                title="Effacer les notifications"
                onClick={handleClearNotifications}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            )}

            {/* Notification Dropdown Panel */}
            {notifOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '340px',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 200,
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border-light)', fontWeight: 700, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Notifications Système</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{totalNotifs} récente(s)</span>
                </div>

                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {totalNotifs === 0 ? (
                    <div style={{ padding: '20px 14px', fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                      Aucune notification récente.
                    </div>
                  ) : (
                    <>
                      {/* Password Security Notifications for Admin */}
                      {isAdmin && securityNotifs.map((sn) => (
                        <div
                          key={`sn-${sn.id}`}
                          style={{
                            padding: '12px 14px',
                            borderBottom: '1px solid var(--color-border-light)',
                            backgroundColor: '#fefce8',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '12px' }}>🔒</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#854d0e' }}>
                              Changement de Mot de Passe
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#713f12', lineHeight: 1.4 }}>
                            {sn.description}
                          </div>
                          <div style={{ fontSize: '10px', color: '#a16207', marginTop: '4px' }}>
                            {formatDate(sn.created_at)}
                          </div>
                        </div>
                      ))}

                      {/* Stock Notifications */}
                      {lowStockItems.map((item, idx) => {
                        const prodName = item.product_name || item.name || `Produit #${item.product_id || item.id}`
                        const qty = item.current_stock ?? item.stock_quantity ?? 0
                        return (
                          <div
                            key={item.id || item.product_id || idx}
                            style={{
                              padding: '10px 14px',
                              borderBottom: '1px solid var(--color-border-light)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                                {prodName}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                Cat: {item.category_name || 'Général'} {item.sku ? `• SKU: ${item.sku}` : ''}
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                backgroundColor: qty === 0 ? '#ffe4e6' : '#fef3c7',
                                color: qty === 0 ? '#e11d48' : '#b45309',
                              }}
                            >
                              {qty === 0 ? 'Rupture (0)' : `Reste: ${qty}`}
                            </span>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile dropdown pill */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                userSelect: 'none',
                padding: '4px 6px',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              {/* Avatar circle */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e564d, #2d8a7c)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  overflow: 'hidden',
                  border: '1.5px solid #edf2f0',
                }}
              >
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'M'}
              </div>

              {/* Name & role */}
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                    {displayName}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  {displayRole}
                </span>
              </div>
            </div>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '180px',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  overflow: 'hidden',
                  padding: '6px 0',
                }}
              >
                <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--color-border-light)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{user?.email || 'admin@jewelrypos.com'}</div>
                  <span className="badge badge-primary" style={{ fontSize: '10px', marginTop: '4px', backgroundColor: '#1e564d' }}>
                    {user?.role || 'ADMIN'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    navigate('/users')
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 14px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: 'var(--color-text)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  Mon Compte
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    logout()
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 14px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: 'var(--color-danger)',
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Title & Action Bar */}
      {title && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '4px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#111827',
                margin: 0,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {actions}
            </div>
          )}
        </div>
      )}
    </div>
  )
}