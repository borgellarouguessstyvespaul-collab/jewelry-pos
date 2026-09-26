import { useState, useEffect } from 'react'
import Header from '../components/layout/Header'
import { useAuth } from '../context/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()
  const [savedSuccess, setSavedSuccess] = useState(false)

  const [storeSettings, setStoreSettings] = useState({
    storeName: 'KISA Boutique',
    phone: '+509 3700-0000',
    address: 'Boutique Principale - KISA Boutique',
    receiptFooter: 'Mèsi pou vizit ou nan KISA Boutique !',
    currencySymbol: 'HTG',
    currencyName: 'HTG (Gourdes)',
    lowStockThreshold: 5,
    taxRate: 0,
    disableBusinessHoursRestriction: false,
  })

  useEffect(() => {
    const saved = localStorage.getItem('kisa_boutique_settings')
    if (saved) {
      try {
        setStoreSettings(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const handleSaveSettings = (e) => {
    e.preventDefault()
    localStorage.setItem('kisa_boutique_settings', JSON.stringify(storeSettings))
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3500)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <Header
        title="Paramètres du Système"
        subtitle="Configuration de la boutique KISA Boutique, tickets de caisse, devise et sécurité"
      />

      <div style={{ padding: '0 4px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '880px' }}>
        {savedSuccess && (
          <div
            style={{
              padding: '12px 18px',
              backgroundColor: '#eaf7ed',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-lg)',
              color: '#166534',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Les paramètres de KISA Boutique ont été enregistrés avec succès.</span>
            <button
              onClick={() => setSavedSuccess(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontSize: '14px' }}
            >
              X
            </button>
          </div>
        )}

        {/* Store Settings Form */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--color-text)' }}>
            Informations de la Bijouterie
          </h3>

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Nom de l'Établissement
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={storeSettings.storeName}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Numéro de Téléphone
                </label>
                <input
                  type="text"
                  className="input"
                  value={storeSettings.phone}
                  onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                Adresse de la Boutique
              </label>
              <input
                type="text"
                className="input"
                value={storeSettings.address}
                onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Symbole Monétaire
                </label>
                <select
                  className="input"
                  value={storeSettings.currencySymbol}
                  onChange={(e) => setStoreSettings({ ...storeSettings, currencySymbol: e.target.value })}
                >
                  <option value="$">$ (Dollar US)</option>
                  <option value="HTG">HTG (Gourdes)</option>
                  <option value="€">€ (Euro)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Seuil Alerte Stock Bas
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  className="input"
                  value={storeSettings.lowStockThreshold}
                  onChange={(e) => setStoreSettings({ ...storeSettings, lowStockThreshold: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Taux de Taxe (%)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="input"
                  value={storeSettings.taxRate}
                  onChange={(e) => setStoreSettings({ ...storeSettings, taxRate: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                Message de pied de page sur les tickets de caisse
              </label>
              <textarea
                className="input"
                rows={2}
                value={storeSettings.receiptFooter}
                onChange={(e) => setStoreSettings({ ...storeSettings, receiptFooter: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="submit" className="btn btn-primary">
                Enregistrer les Paramètres
              </button>
            </div>
          </form>
        </div>

        {/* Emergency Business Hours Restriction Card */}
        <div className="card" style={{ padding: '24px', border: storeSettings.disableBusinessHoursRestriction ? '1px solid var(--color-warning)' : '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--color-text)' }}>
                Restriction des Heures de Service & Mode Urgence
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                Normalement, les utilisateurs non-admins n'ont accès qu'entre <strong>8h00</strong> et <strong>18h00</strong>. Activer le mode urgence désactive cette limite.
              </p>
            </div>
            <span
              className={`badge ${storeSettings.disableBusinessHoursRestriction ? 'badge-warning' : 'badge-success'}`}
              style={{ fontSize: '12px', padding: '6px 12px', fontWeight: 700 }}
            >
              {storeSettings.disableBusinessHoursRestriction ? 'Restriction Désactivée (Urgence)' : 'Restriction Active (8h - 18h)'}
            </span>
          </div>

          <div style={{ background: 'var(--color-surface-2)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', border: '1px solid var(--color-border-light)' }}>
            <div>
              <strong style={{ fontSize: '14px', display: 'block', marginBottom: '2px', color: 'var(--color-text)' }}>
                Désactiver la limite d'horaire (Accès libre 24/7)
              </strong>
              <small style={{ color: 'var(--color-text-dim)', fontSize: '12px' }}>
                En cas d'urgence, activer cette option permet aux caissiers et gestionnaires de travailler en dehors des heures d'ouverture normales.
              </small>
            </div>
            <button
              type="button"
              onClick={() => {
                const updated = {
                  ...storeSettings,
                  disableBusinessHoursRestriction: !storeSettings.disableBusinessHoursRestriction,
                }
                setStoreSettings(updated)
                localStorage.setItem('kisa_boutique_settings', JSON.stringify(updated))
                setSavedSuccess(true)
                setTimeout(() => setSavedSuccess(false), 3500)
              }}
              className="btn btn-secondary"
              style={{ padding: '8px 18px', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              {storeSettings.disableBusinessHoursRestriction ? 'Réactiver la Limit (8h-18h)' : 'Désactiver la Limit (Urgence)'}
            </button>
          </div>
        </div>

        {/* Current User Profile Card */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--color-text)' }}>
            Profil Utilisateur Connecté
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block' }}>Nom d'affichage</span>
              <strong style={{ fontSize: '14px' }}>{user?.full_name || 'Marcus Robb'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block' }}>Email</span>
              <strong style={{ fontSize: '14px' }}>{user?.email || 'admin@jewelrypos.com'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block' }}>Rôle Système</span>
              <span className="badge badge-primary" style={{ marginTop: '4px' }}>
                {user?.role || 'ADMIN'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block' }}>Statut du Compte</span>
              <span className="badge badge-success" style={{ marginTop: '4px' }}>
                Actif & Sécurisé
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
