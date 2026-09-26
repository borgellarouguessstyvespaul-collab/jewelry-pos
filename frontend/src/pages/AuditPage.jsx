import { useState, useEffect, useCallback } from 'react'
import Header from '../components/layout/Header'
import auditService from '../services/auditService'
import { formatDate } from '../utils/formatters'

export default function AuditPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('')

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await auditService.getAll({
        action: actionFilter || undefined,
        limit: 100,
      })
      setLogs(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [actionFilter])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <Header
        title="Journal d'Audit & Sécurité"
        subtitle="Historique immuable de toutes les opérations sensibles (ventes, mots de passe, annulations, stock)"
      />

      <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="card" style={{ padding: 'var(--space-4)', display: 'flex', gap: '12px' }}>
          <select
            className="input"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{ maxWidth: '340px' }}
          >
            <option value="">Toutes les actions (Rapport complet)</option>
            <option value="PASSWORD_CHANGED">Changements de mots de passe</option>
            <option value="USER_CREATED">Création d'utilisateurs</option>
            <option value="LOGIN">Connexion utilisateur</option>
            <option value="SALE_CREATED">Vente effectuée</option>
            <option value="SALE_DELETED_OR_CANCELLED">Commande supprimée / annulée</option>
            <option value="STOCK_ADJUSTED">Ajustement de stock</option>
            <option value="USER_DELETED">Utilisateur supprimé définitivement</option>
          </select>
        </div>

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
                    <th>Date & Heure</th>
                    <th>Utilisateur</th>
                    <th>Action</th>
                    <th>Détails / Mot de passe</th>
                    <th>Adresse IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>
                        Aucun journal d'audit enregistré.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const isPwdChange = log.action === 'PASSWORD_CHANGED'
                      return (
                        <tr key={log.id} style={{ backgroundColor: isPwdChange ? '#fefce8' : 'transparent' }}>
                          <td style={{ color: 'var(--color-text-dim)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                            {formatDate(log.created_at)}
                          </td>
                          <td>
                            <strong>{log.user ? (log.user.name || log.user.full_name) : (log.user_id ? `User #${log.user_id}` : 'Système')}</strong>
                          </td>
                          <td>
                            <span
                              style={{
                                padding: '3px 10px',
                                borderRadius: '9999px',
                                fontSize: '11px',
                                fontWeight: 700,
                                backgroundColor: isPwdChange
                                  ? '#ca8a04'
                                  : log.action?.includes('CANCEL') || log.action?.includes('DELETE')
                                  ? '#e11d48'
                                  : log.action?.includes('CREATE') || log.action?.includes('SALE')
                                  ? '#16a34a'
                                  : '#0284c7',
                                color: '#ffffff',
                                display: 'inline-block',
                              }}
                            >
                              {log.action === 'PASSWORD_CHANGED' ? 'MOT DE PASSE MODIFIÉ' : log.action}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', color: isPwdChange ? '#854d0e' : 'var(--color-text-muted)', fontWeight: isPwdChange ? 600 : 400 }}>
                            {log.description || (log.details ? (typeof log.details === 'object' ? JSON.stringify(log.details) : log.details) : '-')}
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-text-dim)' }}>
                            {log.ip_address || '127.0.0.1'}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
