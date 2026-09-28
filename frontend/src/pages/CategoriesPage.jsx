import { useState, useEffect } from 'react'
import Header from '../components/layout/Header'
import Modal from '../components/common/Modal'
import categoryService from '../services/categoryService'
import productService from '../services/productService'
import { formatCurrency } from '../utils/formatters'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState('')
  const [expandedCats, setExpandedCats] = useState({})

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  // State for creating product inside category
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [selectedCatForProd, setSelectedCatForProd] = useState(null)
  const [prodFormData, setProdFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    price: '',
    cost_price: '',
    stock_quantity: 1,
    description: '',
  })

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3500)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [cats, prods] = await Promise.all([
        categoryService.getAll(),
        productService.getAll({ limit: 500 }),
      ])
      setCategories(cats || [])
      setAllProducts(prods || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const toggleExpand = (catId) => {
    setExpandedCats((prev) => ({ ...prev, [catId]: !prev[catId] }))
  }

  const expandAll = () => {
    const all = {}
    categories.forEach((c) => { all[c.id] = true })
    setExpandedCats(all)
  }

  const collapseAll = () => setExpandedCats({})

  const getProductsForCat = (catId) =>
    allProducts.filter((p) => p.category_id === catId && p.is_active !== false)

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat)
    setFormData({ name: cat.name, description: cat.description || '' })
    setIsModalOpen(true)
  }

  const handleOpenAddProduct = (cat) => {
    setSelectedCatForProd(cat)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    setProdFormData({
      name: '',
      sku: `PRD-${randomSuffix}`,
      barcode: `2026${Math.floor(10000000 + Math.random() * 90000000)}`,
      price: '',
      cost_price: '',
      stock_quantity: 1,
      description: '',
    })
    setIsProductModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData)
        showSuccess(`Catégorie "${formData.name}" modifiée avec succès !`)
      } else {
        await categoryService.create(formData)
        showSuccess(`Catégorie "${formData.name}" créée avec succès !`)
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur enregistrement catégorie')
    }
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCatForProd) return
    try {
      const payload = {
        name: prodFormData.name.trim(),
        sku: prodFormData.sku.trim() || undefined,
        barcode: prodFormData.barcode.trim() || undefined,
        category_id: Number(selectedCatForProd.id),
        selling_price: Number(prodFormData.price),
        purchase_price: prodFormData.cost_price ? Number(prodFormData.cost_price) : 0,
        stock_quantity: Number(prodFormData.stock_quantity || 0),
        low_stock_threshold: 5,
        description: prodFormData.description?.trim() || null,
      }
      const created = await productService.create(payload)
      showSuccess(`Produit "${created.name}" ajouté dans "${selectedCatForProd.name}" !`)
      setIsProductModalOpen(false)
      loadData()
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de l'ajout du produit")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous supprimer cette catégorie ?')) return
    try {
      await categoryService.delete(id)
      showSuccess('Catégorie supprimée avec succès.')
      loadData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur suppression')
    }
  }

  const statusBadge = (qty, threshold = 5) => {
    if (qty <= 0)
      return (
        <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, backgroundColor: '#ffe4e6', color: '#e11d48', border: '1px solid #fecdd3' }}>
          Rupture
        </span>
      )
    if (qty < threshold)
      return (
        <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
          Stock Bas
        </span>
      )
    return (
      <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}>
        Normal
      </span>
    )
  }

  return (
    <div className="w-full overflow-x-hidden" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header
        title="Gestion des Catégories"
        subtitle="Organiser les matériels, accessoires et articles par catégorie — cliquez sur une catégorie pour voir ses produits"
        actions={
          <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
            + Nouvelle Catégorie
          </button>
        }
      />

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
        {/* Expand/Collapse all controls */}
        {!loading && categories.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={expandAll} className="btn btn-secondary btn-sm" style={{ fontSize: '12px' }}>
              ▼ Tout déplier
            </button>
            <button onClick={collapseAll} className="btn btn-secondary btn-sm" style={{ fontSize: '12px' }}>
              ▲ Tout replier
            </button>
          </div>
        )}

        {loading ? (
          <div className="card" style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="spinner"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Aucune catégorie trouvée. Créez votre première catégorie.
          </div>
        ) : (
          categories.map((cat) => {
            const products = getProductsForCat(cat.id)
            const isOpen = !!expandedCats[cat.id]

            return (
              <div
                key={cat.id}
                className="card"
                style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--color-border)' }}
              >
                {/* Category Header Row — Responsive flex-col for mobile, sm:flex-row for desktop */}
                <div
                  onClick={() => toggleExpand(cat.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-5 sm:py-3.5 cursor-pointer select-none transition-colors"
                  style={{
                    backgroundColor: isOpen ? '#f0f9f6' : 'var(--color-surface)',
                    borderBottom: isOpen ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  {/* Left Info Section */}
                  <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto flex-1">
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#1e564d',
                        transition: 'transform 0.2s',
                        display: 'inline-block',
                        marginTop: '2px',
                        sm: { marginTop: '0' },
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      }}
                    >
                      ▶
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text)' }}>
                          {cat.name}
                        </span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: products.length > 0 ? '#eef5f3' : '#f3f4f6',
                            color: products.length > 0 ? '#1e564d' : '#6b7280',
                            border: `1px solid ${products.length > 0 ? '#cce5df' : '#e5e7eb'}`,
                          }}
                        >
                          {products.length} produit{products.length !== 1 ? 's' : ''}
                        </span>
                        {cat.is_active ? (
                          <span className="badge badge-success" style={{ fontSize: '11px' }}>Actif</span>
                        ) : (
                          <span className="badge badge-danger" style={{ fontSize: '11px' }}>Inactif</span>
                        )}
                      </div>
                      {cat.description && (
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {cat.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons — stop propagation so clicking them doesn't toggle expand */}
                  <div
                    className="flex flex-wrap items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleOpenAddProduct(cat)}
                      className="btn btn-primary btn-sm flex-1 sm:flex-none justify-center"
                      style={{ fontSize: '12px' }}
                      title="Ajouter un produit dans cette catégorie"
                    >
                      + Produit
                    </button>
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="btn btn-secondary btn-sm flex-1 sm:flex-none justify-center"
                      style={{ fontSize: '12px' }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="btn btn-secondary btn-sm flex-1 sm:flex-none justify-center"
                      style={{ fontSize: '12px', color: 'var(--color-danger)' }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                {/* Expandable Products Table with horizontal scroll wrapper */}
                {isOpen && (
                  <div style={{ animation: 'fadeIn 0.2s ease' }}>
                    {products.length === 0 ? (
                      <div style={{ padding: '20px 24px', color: 'var(--color-text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                        Aucun produit dans cette catégorie. Cliquez sur "+ Produit" pour en ajouter un.
                      </div>
                    ) : (
                      <div className="table-wrapper overflow-x-auto" style={{ margin: 0 }}>
                        <table style={{ fontSize: '13px', width: '100%', minWidth: '550px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                              <th>Désignation</th>
                              <th>Code / SKU</th>
                              <th>Prix Vente (HTG)</th>
                              <th>Coût Achat (HTG)</th>
                              <th>Stock</th>
                              <th>Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((p) => {
                              const qty = p.stock_quantity ?? 0
                              const threshold = p.low_stock_threshold ?? 5
                              return (
                                <tr key={p.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                                  <td>
                                    <strong style={{ fontSize: '13px' }}>{p.name}</strong>
                                    {p.description && (
                                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                        {p.description}
                                      </div>
                                    )}
                                  </td>
                                  <td>
                                    <div style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#1e564d' }}>
                                      {p.sku || '-'}
                                    </div>
                                    {p.barcode && (
                                      <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                        {p.barcode}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ fontWeight: 800, color: 'var(--color-text)' }}>
                                    {formatCurrency(p.selling_price ?? p.price ?? 0)}
                                  </td>
                                  <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                    {formatCurrency(p.purchase_price ?? p.cost_price ?? 0)}
                                  </td>
                                  <td style={{ fontWeight: 700 }}>
                                    <span
                                      style={{
                                        padding: '2px 8px',
                                        borderRadius: '9999px',
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        backgroundColor: qty <= 0 ? '#ffe4e6' : qty < threshold ? '#fef3c7' : '#f0fdf4',
                                        color: qty <= 0 ? '#e11d48' : qty < threshold ? '#b45309' : '#166534',
                                      }}
                                    >
                                      {qty}
                                    </span>
                                  </td>
                                  <td>{statusBadge(qty, threshold)}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Modifier Catégorie' : 'Créer une Catégorie'}
        maxWidth="460px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Nom de la catégorie *
            </label>
            <input
              type="text"
              required
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Description
            </label>
            <textarea
              className="input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
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

      {/* Product inside Category Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={`Ajouter un Produit dans "${selectedCatForProd?.name || ''}"`}
        maxWidth="500px"
      >
        <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Désignation du Produit *
            </label>
            <input
              type="text"
              required
              className="input"
              placeholder="Ex: Câble / Accessoire..."
              value={prodFormData.name}
              onChange={(e) => setProdFormData({ ...prodFormData, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                Prix Vente (HTG) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="input"
                placeholder="0.00"
                value={prodFormData.price}
                onChange={(e) => setProdFormData({ ...prodFormData, price: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                Coût Achat (HTG)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                placeholder="0.00"
                value={prodFormData.cost_price}
                onChange={(e) => setProdFormData({ ...prodFormData, cost_price: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                Quantité en Stock *
              </label>
              <input
                type="number"
                min="0"
                required
                className="input"
                value={prodFormData.stock_quantity}
                onChange={(e) => setProdFormData({ ...prodFormData, stock_quantity: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                Code SKU
              </label>
              <input
                type="text"
                className="input"
                style={{ fontFamily: 'monospace' }}
                value={prodFormData.sku}
                onChange={(e) => setProdFormData({ ...prodFormData, sku: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Valider et Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}