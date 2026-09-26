import { useState, useEffect, useCallback } from 'react'
import Header from '../components/layout/Header'
import Modal from '../components/common/Modal'
import productService from '../services/productService'
import stockService from '../services/stockService'
import categoryService from '../services/categoryService'
import { formatCurrency } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

export default function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Product Create/Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    category_id: '',
    price: '',
    cost_price: '',
    stock_quantity: 0,
    description: '',
  })

  // Restock "Faire le plein" Modal State
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false)
  const [restockProduct, setRestockProduct] = useState(null)
  const [restockForm, setRestockForm] = useState({
    quantity: 10,
    reason: 'Ravitaillement / Faire le plein',
  })
  const [isSubmittingRestock, setIsSubmittingRestock] = useState(false)

  const { user } = useAuth()
  const canManage = user?.role === 'ADMIN' || user?.role === 'GESTIONNAIRE'
  const isAdmin = user?.role === 'ADMIN'

  // Load Inventory Data with SQL JOIN backend service
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [invData, catsData] = await Promise.all([
        stockService.getAll({
          search: search || undefined,
          category_id: selectedCategory || undefined,
        }),
        categoryService.getAll(),
      ])
      setInventory(invData || [])
      setCategories(catsData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory])

  useEffect(() => {
    loadData()
  }, [loadData])

  const showSuccess = (msg) => {
    setErrorMessage('')
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 5000)
  }

  const showError = (msg) => {
    setSuccessMessage('')
    setErrorMessage(msg)
    setTimeout(() => setErrorMessage(''), 6000)
  }

  // Count low-stock and rupture items for alert banner
  const lowStockCount = inventory.filter(
    (item) => (item.current_stock ?? item.stock_quantity ?? 0) < (item.low_stock_threshold || 5)
  ).length

  // Generate random auto codes for new product
  const generateAutoCodes = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const autoSku = `PRD-${randomSuffix}`
    const autoBarcode = `2026${Math.floor(10000000 + Math.random() * 90000000)}`
    return { autoSku, autoBarcode }
  }

  const handleOpenCreate = () => {
    setEditingProduct(null)
    const { autoSku, autoBarcode } = generateAutoCodes()
    setProductForm({
      name: '',
      sku: autoSku,
      barcode: autoBarcode,
      category_id: categories[0]?.id || '',
      price: '',
      cost_price: '',
      stock_quantity: 1,
      description: '',
    })
    setIsProductModalOpen(true)
  }

  const handleOpenEdit = (p) => {
    setEditingProduct(p)
    setProductForm({
      name: p.name || p.product_name || '',
      sku: p.sku || '',
      barcode: p.barcode || '',
      category_id: p.category_id || (categories[0]?.id || ''),
      price: p.selling_price ?? (p.price ?? ''),
      cost_price: p.purchase_price ?? (p.cost_price ?? ''),
      stock_quantity: p.stock_quantity ?? p.current_stock ?? 0,
      description: p.description || '',
    })
    setIsProductModalOpen(true)
  }

  // Open "Faire le plein" modal for a specific pre-selected product
  const handleOpenRestock = (p) => {
    setRestockProduct(p)
    setRestockForm({
      quantity: 10,
      reason: 'Ravitaillement / Faire le plein',
    })
    setIsRestockModalOpen(true)
  }

  // Handle "Faire le plein" Restock Submission
  const handleRestockSubmit = async (e) => {
    e.preventDefault()
    if (!restockProduct) return

    try {
      setIsSubmittingRestock(true)
      const qtyToAdd = Number(restockForm.quantity)
      const productId = restockProduct.id || restockProduct.product_id

      await stockService.adjust({
        product_id: productId,
        movement_type: 'ENTREE',
        quantity: qtyToAdd,
        reason: restockForm.reason || 'Ravitaillement / Faire le plein',
      })

      // IMMEDIATELY update local state table without full page reload
      setInventory((prev) =>
        prev.map((item) => {
          const itemProdId = item.id || item.product_id
          if (itemProdId === productId) {
            const newQty = (item.current_stock || item.stock_quantity || 0) + qtyToAdd
            const threshold = item.low_stock_threshold || 5
            let newStatusCode = 'NORMAL'
            let newStatusLabel = 'Normal'

            if (newQty <= 0) {
              newStatusCode = 'RUPTURE'
              newStatusLabel = 'Rupture'
            } else if (newQty < threshold) {
              newStatusCode = 'STOCK_BAS'
              newStatusLabel = 'Stock Bas'
            }

            return {
              ...item,
              current_stock: newQty,
              stock_quantity: newQty,
              status: newStatusCode,
              status_label: newStatusLabel,
              is_low_stock: newQty < threshold,
            }
          }
          return item
        })
      )

      showSuccess(`✅ "${restockProduct.name || restockProduct.product_name}" rempli avec succès ! +${qtyToAdd} unités ajoutées.`)
      setIsRestockModalOpen(false)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Erreur lors du réapprovisionnement'
      showError(`❌ ${msg}`)
      setIsRestockModalOpen(false)
    } finally {
      setIsSubmittingRestock(false)
    }
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: productForm.name.trim(),
        sku: productForm.sku.trim() || undefined,
        barcode: productForm.barcode.trim() || undefined,
        category_id: Number(productForm.category_id),
        selling_price: Number(productForm.price),
        purchase_price: productForm.cost_price ? Number(productForm.cost_price) : 0,
        stock_quantity: Number(productForm.stock_quantity || 0),
        low_stock_threshold: 5,
        description: productForm.description?.trim() || null,
      }

      if (editingProduct) {
        const productId = editingProduct.id || editingProduct.product_id
        const updated = await productService.update(productId, payload)
        showSuccess(`Le produit "${updated.name}" a été modifié avec succès !`)
      } else {
        const created = await productService.create(payload)
        showSuccess(`Le produit "${created.name}" a été créé avec succès !`)
      }

      setIsProductModalOpen(false)
      loadData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de l’enregistrement')
    }
  }

  const handleDeleteProduct = async (p) => {
    const productId = p.id || p.product_id
    if (!window.confirm(`Supprimer définitivement le produit "${p.name || p.product_name}" ?`)) return
    try {
      await productService.delete(productId)
      setInventory((prev) => prev.filter((item) => (item.id || item.product_id) !== productId))
      showSuccess('Produit supprimé avec succès.')
    } catch (err) {
      showError(err.response?.data?.detail || 'Erreur de suppression')
    }
  }

  // Filter local items by status if status filter is active
  const filteredInventory = inventory.filter((item) => {
    if (selectedStatus === 'ALL') return true
    return item.status === selectedStatus
  })

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <Header
        title="Inventaire Général"
        subtitle="Vue unifiée des produits, niveaux de stock et réapprovisionnement"
        actions={
          canManage && (
            <button
              onClick={handleOpenCreate}
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: '#1e564d', color: '#ffffff', borderRadius: '9999px', padding: '8px 18px', fontWeight: 600 }}
            >
              + Nouveau Produit
            </button>
          )
        }
      />

      <div style={{ padding: '0 4px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Success Alert */}
        {successMessage && (
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
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#166534' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Global Filter Bar */}
        <div className="card" style={{ padding: '14px 18px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 2, minWidth: '240px' }}>
            <input
              type="text"
              className="input"
              placeholder="Rechercher par nom, code/SKU, code-barres..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <select
              className="input"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '160px' }}>
            <select
              className="input"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">Tous les statuts</option>
              <option value="NORMAL">Normal (En stock)</option>
              <option value="STOCK_BAS">Stock Bas (&lt; 5)</option>
              <option value="RUPTURE">Rupture (0)</option>
            </select>
          </div>
        </div>

        {/* Unified Inventory Table */}
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
                    <th>Article</th>
                    <th>Code / SKU & Barcode</th>
                    <th>Catégorie</th>
                    <th>Stock Actuel</th>
                    <th>Seuil Alerte</th>
                    <th>Statut</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>Aucun article trouvé dans l'inventaire.</p>
                        <small style={{ color: 'var(--color-text-dim)' }}>
                          Modifiez vos critères de recherche ou cliquez sur "+ Nouveau Produit".
                        </small>
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const prodName = item.name || item.product_name
                      const qty = item.current_stock ?? item.stock_quantity ?? 0
                      const threshold = item.low_stock_threshold || 5
                      const status = item.status || (qty <= 0 ? 'RUPTURE' : qty < threshold ? 'STOCK_BAS' : 'NORMAL')

                      return (
                        <tr key={item.id || item.product_id}>
                          {/* 1. Article */}
                          <td>
                            <strong>{prodName}</strong>
                            {item.description && (
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                {item.description}
                              </div>
                            )}
                          </td>

                          {/* 2. Code / SKU & Barcode */}
                          <td>
                            <div style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#1e564d' }}>
                              {item.sku || '-'}
                            </div>
                            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {item.barcode || '-'}
                            </div>
                          </td>

                          {/* 3. Catégorie */}
                          <td>
                            <span className="badge" style={{ backgroundColor: '#eef5f3', color: '#1e564d', fontWeight: 600 }}>
                              {item.category_name || 'Général'}
                            </span>
                          </td>


                          {/* 6. Stock Actuel */}
                          <td>
                            {qty < threshold ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '4px 10px',
                                  borderRadius: '9999px',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  backgroundColor: qty <= 0 ? '#ffe4e6' : '#fef3c7',
                                  color: qty <= 0 ? '#e11d48' : '#b45309',
                                  border: `1px solid ${qty <= 0 ? '#fecdd3' : '#fde68a'}`,
                                }}
                              >
                                {qty}
                              </span>
                            ) : (
                              <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-text)' }}>
                                {qty}
                              </span>
                            )}
                          </td>

                          {/* 7. Seuil Alerte */}
                          <td style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                            {threshold}
                          </td>

                          {/* 8. Statut */}
                          <td>
                            {status === 'RUPTURE' ? (
                              <span
                                style={{
                                  padding: '3px 10px',
                                  borderRadius: '9999px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: '#ffe4e6',
                                  color: '#e11d48',
                                  border: '1px solid #fecdd3',
                                }}
                              >
                                Rupture
                              </span>
                            ) : status === 'STOCK_BAS' ? (
                              <span
                                style={{
                                  padding: '3px 10px',
                                  borderRadius: '9999px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: '#fef3c7',
                                  color: '#b45309',
                                  border: '1px solid #fde68a',
                                }}
                              >
                                Stock Bas
                              </span>
                            ) : (
                              <span
                                style={{
                                  padding: '3px 10px',
                                  borderRadius: '9999px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: '#dcfce7',
                                  color: '#166534',
                                  border: '1px solid #86efac',
                                }}
                              >
                                Normal
                              </span>
                            )}
                          </td>

                          {/* 9. Actions */}
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                              {/* Fast restock button "Faire le plein" */}
                              {canManage && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenRestock(item)}
                                  className="btn btn-primary btn-sm"
                                  style={{
                                    backgroundColor: '#1e564d',
                                    color: '#ffffff',
                                    borderRadius: '9999px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '4px 12px',
                                  }}
                                  title="Faire le plein pour ce produit"
                                >
                                  + Faire le plein
                                </button>
                              )}

                              {canManage && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(item)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: '11px' }}
                                >
                                  Modifier
                                </button>
                              )}

                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(item)}
                                  className="btn btn-sm"
                                  style={{ color: 'var(--color-danger)', border: '1px solid #fecdd3', background: '#fff1f2', fontSize: '11px' }}
                                >
                                  Supprimer
                                </button>
                              )}
                            </div>
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

      {/* Modal: "Faire le plein" (Restock Modal) with Pre-Selected Product */}
      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        title="Faire le plein — Entrée de Stock"
        maxWidth="460px"
      >
        <form onSubmit={handleRestockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Pre-Selected Product Headline */}
          {restockProduct && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: '#eef5f3',
                border: '1px solid #cce5df',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e564d' }}>
                {restockProduct.name || restockProduct.product_name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', gap: '12px' }}>
                <span>SKU: <strong>{restockProduct.sku || '-'}</strong></span>
                <span>Stock Actuel: <strong>{restockProduct.current_stock ?? restockProduct.stock_quantity ?? 0}</strong></span>
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Quantité à ajouter en Stock *
            </label>
            <input
              type="number"
              min="1"
              required
              className="input"
              value={restockForm.quantity}
              onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })}
              autoFocus
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Motif / Référence Facture Fournisseur
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Reconstitution stock, Facture #INV-2026-09"
              value={restockForm.reason}
              onChange={(e) => setRestockForm({ ...restockForm, reason: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={() => setIsRestockModalOpen(false)} className="btn btn-secondary">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmittingRestock}
              className="btn btn-primary"
              style={{ backgroundColor: '#1e564d', color: '#ffffff' }}
            >
              {isSubmittingRestock ? 'Validation...' : 'Valider & Faire le plein'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Product Form Modal (Create / Edit Product) */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}
        maxWidth="580px"
      >
        <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Désignation du Produit *
            </label>
            <input
              type="text"
              required
              className="input"
              placeholder="Ex: Bague Solitaire Diamant 1.0ct"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Code / SKU *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const { autoSku, autoBarcode } = generateAutoCodes()
                    setProductForm((prev) => ({ ...prev, sku: autoSku, barcode: autoBarcode }))
                  }}
                  style={{ background: 'none', border: 'none', color: '#1e564d', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Régénérer
                </button>
              </div>
              <input
                type="text"
                required
                className="input"
                style={{ fontFamily: 'monospace', fontWeight: 700 }}
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                Catégorie *
              </label>
              <select
                required
                className="input"
                value={productForm.category_id}
                onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
              >
                <option value="">Sélectionner catégorie</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Code-barres
            </label>
            <input
              type="text"
              className="input"
              placeholder="Généré automatiquement ou scannez le produit"
              value={productForm.barcode}
              onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
              style={{ fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                Prix de Vente (HTG) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="input"
                placeholder="0.00"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                Coût d'Achat (HTG)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                placeholder="0.00"
                value={productForm.cost_price}
                onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })}
              />
            </div>
          </div>

          {/* Stock quantity: only show when editing (not on create — use Faire le plein to add stock) */}
          {editingProduct && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                Quantité en Stock Actuelle
              </label>
              <input
                type="number"
                min="0"
                className="input"
                value={productForm.stock_quantity}
                onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
              />
              <small style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
                Pour ajouter du stock, utilisez le bouton "Faire le plein" dans le tableau.
              </small>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Description (optionnel)
            </label>
            <textarea
              className="input"
              rows={2}
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#1e564d' }}>
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
