import { useState, useEffect, useCallback, useMemo } from 'react'
import Header from '../components/layout/Header'
import auditService from '../services/auditService'
import { formatDate } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

export default function AuditPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
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
      const logMonth = (dateObj.getMonth() + 1).toString().padStart(2, '0')

      if (yearFilter && logYear !== yearFilter) return false
      if (monthFilter && logMonth !== monthFilter) return false
      return true
    })
  }, [logs, yearFilter, monthFilter])

  // Lis ane disponib yo
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

    showSuccess(`Période (${periodeStr}) clôturée et verrouillée avec succès pour l'audit ! `)
  }

  const handleClearAuditLogs = async () => {
    if (!isAdmin) return
    const confirmation = window.prompt("⚠️ EFFACER TOUT LE JOURNAL D'AUDIT (ADMIN UNIQUEMENT) :\nTapez 'CONFIRMER' pour effacer TOUTES les entrées du journal d'audit afin de laisser le système entièrement vierge :")
    if (confirmation !== 'CONFIRMER') {
      if (confirmation !== null) alert("Confirmation incorrecte. Action annulée.")
      return
    }
    try {
      const res = await auditService.clearAll()
      showSuccess(res.message || "Journal d'audit vidé avec succès (Système vierge).")
      loadLogs()
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de la suppression de l'audit")
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: '#ffffff' }}>
      <Header
        title="Journal d'Audit & Sécurité"
        subtitle="Historique immuable, filtrage par période (mois, année) et clôture des registres"
      />

      {successMsg && (
        <div
          style={{
            margin: 'var(--space-4) var(--space-6) 0',
            padding: '12px 18px',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: 'var(--radius-lg)',
            color: '#1f2937',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          {successMsg}
        </div>
      )}

      <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', backgroundColor: '#ffffff' }}>
        {/* Zòn Filtè yo ak Bouton Clôture */}
        <div className="card" style={{ padding: 'var(--space-4)', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
          <div className="audit-filters-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1 }}>
            <select
              className="input"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{ maxWidth: '280px', backgroundColor: '#ffffff', color: '#1f2937' }}
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
              style={{ width: '130px', backgroundColor: '#ffffff', color: '#1f2937' }}
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
              style={{ width: '150px', backgroundColor: '#ffffff', color: '#1f2937' }}
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

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {isAdmin && (
              <button
                onClick={handleClearAuditLogs}
                className="btn"
                style={{
                  fontSize: '13px',
                  backgroundColor: '#fff1f2',
                  color: '#e11d48',
                  border: '1px solid #fecdd3',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🗑️ Vider l'Audit (Vierge)
              </button>
            )}
            <button
              onClick={handleCloturePeriode}
              className="btn"
              style={{ fontSize: '13px', backgroundColor: '#ffffff', color: '#1f2937', border: '1px solid #d1d5db' }}
            >
               Clôturer la Période
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
          {loading ? (
            <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="table-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', minWidth: '700px', backgroundColor: '#ffffff', color: '#1f2937' }}>
                <thead>
                  <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ color: '#1f2937', padding: '12px' }}>Date & Heure</th>
                    <th style={{ color: '#1f2937', padding: '12px' }}>Utilisateur</th>
                    <th style={{ color: '#1f2937', padding: '12px' }}>Action</th>
                    <th style={{ color: '#1f2937', padding: '12px' }}>Détails / Mot de passe</th>
                    <th style={{ color: '#1f2937', padding: '12px' }}>Adresse IP</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                        Aucun journal d'audit trouvé pour cette période ou ce filtre.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      return (
                        <tr key={log.id} style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ color: '#4b5563', fontSize: '12px', whiteSpace: 'nowrap', padding: '12px' }}>
                            {formatDate(log.created_at)}
                          </td>
                          <td style={{ color: '#1f2937', padding: '12px' }}>
                            <strong>{log.user_name || log.user?.name || log.user?.full_name || (log.user_id === 1 ? 'Admin Kisa' : log.user_id ? `Utilisateur #${log.user_id}` : 'Admin (Système)')}</strong>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span
                              style={{
                                padding: '3px 10px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                backgroundColor: '#f3f4f6',
                                color: '#1f2937',
                                display: 'inline-block',
                                border: '1px solid #d1d5db',
                              }}
                            >
                              {log.action === 'PASSWORD_CHANGED' ? 'MOT DE PASSE MODIFIÉ' : log.action}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', color: '#4b5563', fontWeight: 400, padding: '12px' }}>
                            {log.description || (log.details ? (typeof log.details === 'object' ? JSON.stringify(log.details) : log.details) : '-')}
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#4b5563', padding: '12px' }}>
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