import { useState, useEffect, useCallback } from 'react'
import Header from '../components/layout/Header'
import Modal from '../components/common/Modal'
import userService from '../services/userService'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/formatters'

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'ADMIN'

  // Admin state
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'GESTIONNAIRE',
    password: '',
  })

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return
    try {
      setLoading(true)
      const data = await userService.getAll()
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleOpenCreate = () => {
    setEditingUser(null)
    setFormData({ email: '', full_name: '', role: 'CAISSIER', password: '' })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (u) => {
    setEditingUser(u)
    setFormData({
      email: u.email,
      full_name: u.full_name || u.name,
      role: u.role,
      password: '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        const payload = { ...formData }
        if (!payload.password) delete payload.password
        await userService.update(editingUser.id, payload)
        showSuccess(`Utilisateur "${formData.full_name}" modifié avec succès.`)
      } else {
        await userService.create(formData)
        showSuccess(`Utilisateur "${formData.full_name}" créé avec succès.`)
      }
      setIsModalOpen(false)
      loadUsers()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de l\'enregistrement de l\'utilisateur')
    }
  }

  const handleDelete = async (u) => {
    if (u.role === 'ADMIN') {
      alert("L'administrateur ne peut pas être supprimé.")
      return
    }
    if (!window.confirm(`Supprimer définitivement l'utilisateur "${u.full_name || u.name}" ?`)) return
    try {
      await userService.delete(u.id)
      showSuccess(`Utilisateur "${u.full_name || u.name}" supprimé avec succès.`)
      loadUsers()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de la suppression')
    }
  }

  // Render NON-ADMIN profile view
  if (!isAdmin) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <Header
          title="Mon Profil"
          subtitle="Consultez vos informations de compte utilisateur"
        />

        <div style={{ maxWidth: '600px' }}>
          {/* Profile Card */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e564d, #2d8a7c)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  fontWeight: 800,
                }}
              >
                {(currentUser?.full_name || currentUser?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                  {currentUser?.full_name || currentUser?.name}
                </h3>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {currentUser?.email}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--color-border-light)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Rôle Système :</span>
                <span
                  style={{
                    padding: '3px 12px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: currentUser?.role === 'GESTIONNAIRE' ? '#e0f2fe' : '#dcfce7',
                    color: currentUser?.role === 'GESTIONNAIRE' ? '#0369a1' : '#15803d',
                  }}
                >
                  {currentUser?.role === 'GESTIONNAIRE' ? 'Gestionnaire' : 'Caissier / Vendeur'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Statut Compte :</span>
                <span style={{ fontWeight: 600, color: '#16a34a' }}>Actif</span>
              </div>

              <div style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border-light)', fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                La gestion des accès et mots de passe est gérée exclusivement par l'Administrateur unique. Contactez l'administrateur pour toute modification de vos identifiants.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render ADMIN user management view
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <Header
        title="Gestion des Utilisateurs"
        subtitle="Gestion des comptes et des accès utilisateurs"
        actions={
          <button
            onClick={handleOpenCreate}
            className="btn btn-primary btn-sm"
            style={{ backgroundColor: '#1e564d', color: '#ffffff', borderRadius: '9999px', padding: '8px 16px', fontWeight: 600 }}
          >
            + Créer un Utilisateur
          </button>
        }
      />

      {/* Success toast */}
      {successMsg && (
        <div
          style={{
            margin: '0 var(--space-6) var(--space-3)',
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
                    <th>Nom Complet</th>
                    <th>Email / Identifiant</th>
                    <th>Rôle Système</th>
                    <th>Statut</th>
                    <th>Date Création</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...users]
                    .filter((u) => u.email !== 'admin@jewelrypos.com' && u.email !== 'kisa@kisa.com')
                    .sort((a, b) => {
                      // Sort: ADMIN first, then GESTIONNAIRE, then CAISSIER, then by name
                      const roleOrder = { ADMIN: 0, GESTIONNAIRE: 1, CAISSIER: 2 }
                      const roleA = roleOrder[a.role] ?? 3
                      const roleB = roleOrder[b.role] ?? 3
                      if (roleA !== roleB) return roleA - roleB
                      return (a.full_name || a.name || '').localeCompare(b.full_name || b.name || '')
                    })
                    .map((u) => {
                    const isUserAdmin = u.role === 'ADMIN'
                    return (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                          {u.full_name || u.name}
                        </td>
                        <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{u.email}</td>
                        <td>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: isUserAdmin ? '#1e564d' : u.role === 'GESTIONNAIRE' ? '#0369a1' : '#166534' }}>
                            {isUserAdmin ? 'Administrateur' : u.role === 'GESTIONNAIRE' ? 'Gestionnaire' : 'Caissier / Vendeur'}
                          </span>
                        </td>
                        <td>
                          {u.is_active ? (
                            <span className="badge badge-success">Actif</span>
                          ) : (
                            <span className="badge badge-danger">Désactivé</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--color-text-dim)', fontSize: '12px' }}>
                          {formatDate(u.created_at)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="action-buttons-cell" style={{ justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '12px' }}
                            >
                              Modifier
                            </button>
                            {!isUserAdmin && (
                              <button
                                onClick={() => handleDelete(u)}
                                className="btn btn-sm"
                                style={{ color: 'var(--color-danger)', border: '1px solid #fecdd3', background: '#fff1f2', fontSize: '12px' }}
                              >
                                Supprimer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Modifier : ${editingUser.full_name || editingUser.name}` : 'Créer un Utilisateur'}
        maxWidth="480px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Nom et Prénom *
            </label>
            <input
              type="text"
              required
              className="input"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Email de Connexion *
            </label>
            <input
              type="email"
              required
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Rôle Attribué *
            </label>
            {!editingUser ? (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>👤</span>
                <span>Caissier / Vendeur (Caisse & Ventes uniquement)</span>
              </div>
            ) : editingUser.role === 'ADMIN' ? (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#f8faf9',
                  color: '#1e564d',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: '1px solid var(--color-border)',
                }}
              >
                Administrateur (Non modifiable)
              </div>
            ) : (
              <select
                className="input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="CAISSIER">Caissier / Vendeur (Caisse & Ventes uniquement)</option>
                {editingUser.role === 'GESTIONNAIRE' && (
                  <option value="GESTIONNAIRE">Gestionnaire (Stock, Produits, Rapports, POS)</option>
                )}
              </select>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              {editingUser ? 'Nouveau mot de passe (laisser vide pour conserver)' : 'Mot de passe initial *'}
            </label>
            <input
              type="password"
              required={!editingUser}
              className="input"
              placeholder={editingUser ? 'Laisser vide pour conserver' : '••••••••'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#1e564d' }}>
              {editingUser ? 'Enregistrer' : 'Créer l\'utilisateur'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
