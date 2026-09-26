import { useState, useEffect, useCallback } from 'react'
import Header from '../components/layout/Header'
import Modal from '../components/common/Modal'
import customerService from '../services/customerService'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  })

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const data = await customerService.getAll({ search: search || undefined })
      setCustomers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const handleOpenCreate = () => {
    setEditingCustomer(null)
    setFormData({ name: '', phone: '', email: '', address: '', notes: '' })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (c) => {
    setEditingCustomer(c)
    setFormData({
      name: c.name,
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      notes: c.notes || '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer.id, formData)
      } else {
        await customerService.create(formData)
      }
      setIsModalOpen(false)
      loadCustomers()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur enregistrement client')
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <Header
        title="Gestion de la Clientèle"
        subtitle="Coordonnées clients, historique d'achats et programme fidélité bijouterie"
        actions={
          <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
            Nouveau Client
          </button>
        }
      />

      <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <input
            type="text"
            className="input"
            placeholder="Rechercher par nom ou numéro de téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                    <th>ID Client</th>
                    <th>Nom Complet</th>
                    <th>Téléphone</th>
                    <th>Email</th>
                    <th>Adresse</th>
                    <th>Notes</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                        Aucun client trouvé.
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)' }}>
                          {c.customer_code || `CUST-${1000 + c.id}`}
                        </td>
                        <td>
                          <strong>{c.name}</strong>
                        </td>
                        <td>{c.phone || '-'}</td>
                        <td>{c.email || '-'}</td>
                        <td>{c.address || '-'}</td>
                        <td style={{ color: 'var(--color-text-dim)', fontSize: '12px' }}>
                          {c.notes || '-'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="btn btn-secondary btn-sm"
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Modifier Client' : 'Ajouter un Client'}
        maxWidth="480px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Nom Complet *
            </label>
            <input
              type="text"
              required
              className="input"
              placeholder="Ex: Marie Dupont"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Téléphone
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ex: +509 3000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Email
            </label>
            <input
              type="email"
              className="input"
              placeholder="client@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Adresse
            </label>
            <input
              type="text"
              className="input"
              placeholder="Adresse ou quartier"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Notes / Préférences Bijoux
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Préfère l'or blanc, tour de doigt 52"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
