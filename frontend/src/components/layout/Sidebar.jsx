import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const role = user?.role

  // Navigation config based on roles
  const mainNavItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v9l4 4" />
        </svg>
      ),
      roles: ['ADMIN', 'GESTIONNAIRE'],
    },
    {
      to: '/pos',
      label: 'Finance (POS)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
      roles: ['ADMIN', 'GESTIONNAIRE', 'CAISSIER'],
    },
    {
      to: '/sales',
      label: 'Orders',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
      ),
      roles: ['ADMIN', 'GESTIONNAIRE', 'CAISSIER'],
    },
    {
      to: '/products',
      label: 'Inventaire Général',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      ),
      roles: ['ADMIN', 'GESTIONNAIRE', 'CAISSIER'],
    },
    {
      to: '/categories',
      label: 'Categories',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      ),
      roles: ['ADMIN', 'GESTIONNAIRE'],
    },
    {
      to: '/users',
      label: role === 'ADMIN' ? 'Utilisateurs' : 'Mon Profil',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
      roles: ['ADMIN', 'GESTIONNAIRE', 'CAISSIER'],
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      roles: ['ADMIN', 'GESTIONNAIRE', 'CAISSIER'],
    },
  ]

  const secondaryNavItems = [
    {
      to: '/reports',
      label: 'Report',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      roles: ['ADMIN', 'GESTIONNAIRE'],
    },
    {
      to: '/audit',
      label: 'Help & Audit',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      roles: ['ADMIN'],
    },
  ]

  const filteredMain = mainNavItems.filter((i) => !i.roles || i.roles.includes(role))
  const filteredSecondary = secondaryNavItems.filter((i) => !i.roles || i.roles.includes(role))

  return (
    <aside
      style={{
        width: '210px',
        backgroundColor: 'var(--color-sidebar)',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 14px',
        color: 'var(--color-sidebar-text)',
        flexShrink: 0,
        height: '100%',
        maxHeight: 'calc(100vh - 64px)',
      }}
    >
      <div>
        {/* Top Logo and Hamburger Menu */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 8px 24px 8px',
          }}
        >
          {/* Logo "kisa" style */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: '24px',
                fontWeight: 800,
                letterSpacing: '-0.05em',
                color: '#ffffff',
                lineHeight: 1,
              }}
            >
              kisa
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--color-sidebar-muted)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                borderLeft: '1px solid rgba(255,255,255,0.2)',
                paddingLeft: '6px',
                lineHeight: 1.1,
              }}
            >
              POS<br />BOUTIQUE
            </span>
          </div>

          {/* Hamburger icon */}
          <button
            type="button"
            title="Menu"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <span style={{ width: '18px', height: '2px', background: '#ffffff', borderRadius: '2px' }}></span>
            <span style={{ width: '18px', height: '2px', background: '#ffffff', borderRadius: '2px' }}></span>
            <span style={{ width: '14px', height: '2px', background: '#ffffff', borderRadius: '2px' }}></span>
          </button>
        </div>

        {/* Primary Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filteredMain.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 16px',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-lime-text)' : 'var(--color-sidebar-text)',
                backgroundColor: isActive ? 'var(--color-lime)' : 'transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              {({ isActive }) => (
                <>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? 'var(--color-lime-text)' : 'var(--color-sidebar-muted)',
                    }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Separator */}
        <div
          style={{
            margin: '20px 8px',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        />

        {/* Secondary Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filteredSecondary.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 16px',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-lime-text)' : 'var(--color-sidebar-text)',
                backgroundColor: isActive ? 'var(--color-lime)' : 'transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              {({ isActive }) => (
                <>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? 'var(--color-lime-text)' : 'var(--color-sidebar-muted)',
                    }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Quick logout link at bottom */}
      <div style={{ padding: '0 8px' }}>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0,0,0,0.15)',
            border: 'none',
            color: 'var(--color-sidebar-text)',
            borderRadius: '9999px',
            padding: '8px 14px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
