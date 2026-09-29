import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1.5rem', textAlign: 'center', background: 'var(--bg-primary, #0f172a)' }}>
        <div className="spinner" style={{ width: '42px', height: '42px' }}></div>
        <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.95rem', margin: 0, fontWeight: 500 }}>
          Koneksyon ak sèvè a ap fèt...
        </p>
        <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.8rem', margin: 0, maxWidth: '320px' }}>
          Si sèvè a (Render) te nan dòmi oswa ap re-deplwaye, sa ka pran yon ti tan (1 a 2 minit).
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If cashier doesn't have access to dashboard, redirect to pos
    return <Navigate to="/pos" replace />
  }

  return <Outlet />
}
