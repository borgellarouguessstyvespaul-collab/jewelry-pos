import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Blocks non-admin users from using the app outside business hours (8h–18h).
 */
export default function BusinessHoursGuard({ children }) {
  const { user } = useAuth()

  const isAdmin = user?.role === 'ADMIN'

  // Check if Admin deactivated the restriction in Settings (Mode Urgence)
  let isRestrictionDisabled = false
  try {
    const saved = localStorage.getItem('kisa_boutique_settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      isRestrictionDisabled = !!parsed.disableBusinessHoursRestriction
    }
  } catch {}

  if (isAdmin || isRestrictionDisabled) return children || <Outlet />

  const now = new Date()
  const hour = now.getHours()
  const isOpen = hour >= 8 && hour < 18

  if (!isOpen) {
    const pad = (n) => String(n).padStart(2, '0')
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-canvas)',
          flexDirection: 'column',
          gap: '16px',
          textAlign: 'center',
          padding: '40px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface-3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            marginBottom: '8px',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
          Système Fermé
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', maxWidth: '380px', margin: 0 }}>
          L'accès au système est disponible de <strong>8h00</strong> à <strong>18h00</strong> seulement.
        </p>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '20px 32px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--color-primary)' }}>
            {timeStr}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Heure actuelle
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', margin: 0 }}>
          Contactez votre administrateur si vous avez besoin d'un accès urgent.
        </p>
      </div>
    )
  }

  return children || <Outlet />
}

