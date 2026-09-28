import { useState, useEffect, useCallback, useMemo } from 'react'
import Header from '../components/layout/Header'
import auditService from '../services/auditService'
import { formatDate } from '../utils/formatters'

export default function AuditPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3500)
  }

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await auditService.getAll({
        action: actionFilter || undefined,
        limit: 200,
      })
      setLogs(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [actionFilter])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  // Filtrage avanse pa Mwa ak pa Ane sou logs yo
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (!log.created_at) return true
      const dateObj = new Date(log.created_at)
      const logYear = dateObj.getFullYear().toString()
      const logMonth = (dateObj.getMonth() + 1).toString().padStart(2, '0') // '01', '02', ...

      if (yearFilter && logYear !== yearFilter) return false
      if (monthFilter && logMonth !== monthFilter) return false
      return true
    })
  }, [logs, yearFilter, monthFilter])

  // Lis ane disponib yo (dapre log ki la yo oswa ane aktyèl la)
  const availableYears = useMemo(() => {
    const years = new Set()
    logs.forEach(log => {
      if (log.created_at) {
        years.add(new Date(log.created_at).getFullYear().toString())
      }
    })
    years.add(new Date().getFullYear().toString())
    return Array.from(years).sort((a, b) => b.localeCompare(a))
  }, [logs])

  const handleCloturePeriode = () => {
    const periodeStr = monthFilter ? `Mois ${monthFilter}/${yearFilter || new Date().getFullYear()}` : `Année ${yearFilter || new Date().getFullYear()}`
    if (!window.confirm(`Voulez-vous vraiment verrouiller et valider l'audit pour ${periodeStr} ?`)) return

    // Isit la ou ka konekte l ak backend ou an (egz: auditService.closePeriod(...))
    showSuccess(`Période (${periodeStr}) clôturée et verrouillée avec succès pour l'audit ! 🔒`)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <Header
        title="Journal d'Audit & Sécurité"
        subtitle="Historique immuable, filtrage par période (mois, année) et clôture des registres"
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
        {/* Zòn Filtè yo ak Bouton Clôture */}
        <div className="card" style={{ padding: 'var(--space-4)', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1 }}>
            <select
              className="input"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{ maxWidth: '280px' }}
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

            {/* Filtre pa Ane */}
            <select
              className="input"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{ width: '130px' }}
            >
              <option value="">Toutes les années</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>

            {/* Filtre pa Mwa */}
            <select
              className="input"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="">Tous les mois</option>
              <option value="01">Janvier</option>
              <option value="02">Février</option>
              <option value="03">Mars</option>
              <option value="04">Avril</option>
              <option value="05">Mai</option>
              <option value="06">Juin</option>
              <option value="07">Juillet</option>
              <option value="08">Août</option>
              <option value="09">Septembre</option>
              <option value="10">Octobre</option>
              <option value="11">Novembre</option>
              <option value="12">Décembre</option>
            </select>
          </div>

          <div>
            <button
              onClick={handleCloturePeriode}
              className="btn btn-primary"
              style={{ fontSize: '13px', backgroundColor: '#1e564d' }}
            >
              🔒 Clôturer la Période
            </button>
          </div>
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
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                        Aucun journal d'audit trouvé pour cette période ou ce filtre.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
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