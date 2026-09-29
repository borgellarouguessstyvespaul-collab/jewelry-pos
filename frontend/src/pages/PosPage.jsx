import { useState, useEffect, useCallback, useRef } from 'react'
import Header from '../components/layout/Header'
import ProductCard from '../components/pos/ProductCard'
import Cart from '../components/pos/Cart'
import PaymentModal from '../components/pos/PaymentModal'
import ReceiptModal from '../components/pos/ReceiptModal'

import productService from '../services/productService'
import categoryService from '../services/categoryService'
import saleService from '../services/saleService'
import { useCart } from '../context/CartContext'
import useBarcode from '../hooks/useBarcode'
import { formatCurrency } from '../utils/formatters'

export default function PosPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mobileTab, setMobileTab] = useState('catalog') // 'catalog' | 'cart'

  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [lastSale, setLastSale] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categoryRef = useRef(null)
  const { items, customer, totalDiscount, total, addToCart, clearCart } = useCart()

  // Load initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [prodsData, catsData] = await Promise.all([
        productService.getAll({ is_active: true }),
        categoryService.getAll(),
      ])
      setProducts(prodsData)
      setCategories(catsData)
    } catch (err) {
      console.error('Erreur chargement POS:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Close category panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setIsCategoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle hardware barcode scanning
  const handleBarcodeScan = useCallback(
    async (code) => {
      try {
        const found = products.find((p) => p.barcode === code)
        if (found) {
          addToCart(found)
        } else {
          const product = await productService.getByBarcode(code)
          if (product) {
            addToCart(product)
          } else {
            alert(`Produit introuvable pour le code-barres: ${code}`)
          }
        }
      } catch (err) {
        alert(`Produit introuvable pour le code-barres: ${code}`)
      }
    },
    [products, addToCart]
  )

  useBarcode(handleBarcodeScan)

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true
    const matchesSearch = searchTerm
      ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
      : true
    return matchesCategory && matchesSearch
  })

  // Submit Sale
  const handleConfirmSale = async (paymentDetails) => {
    if (items.length === 0) return

    try {
      setIsSubmitting(true)
      const payload = {
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
        customer_id: customer?.id || null,
        discount: totalDiscount || 0,
        amount_received: paymentDetails.amount_received,
        payment_method: paymentDetails.payment_method,
        notes: paymentDetails.notes || null,
      }

      const completedSale = await saleService.create(payload)
      const formattedItems = (completedSale.sale_items || []).map((si) => {
        const cartItem = items.find((i) => i.product.id === si.product_id)
        return {
          ...si,
          product_name: si.product_name || cartItem?.product?.name || `Produit #${si.product_id}`,
        }
      })
      setLastSale({
        ...completedSale,
        items: formattedItems.length > 0 ? formattedItems : items.map((i) => ({
          product_name: i.product.name,
          quantity: i.quantity,
          unit_price: i.unit_price,
          subtotal: i.quantity * i.unit_price,
        })),
        sale_items: formattedItems,
      })
      setIsPaymentOpen(false)
      setIsReceiptOpen(true)
      clearCart()
      fetchData() // Refresh stock
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || 'Erreur lors de la validation de la vente')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory)
  const categoryLabel = selectedCategoryObj ? selectedCategoryObj.name : 'Toutes les catégories'
  const totalItemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, width: '100%' }}>
      <Header
        title="Point de Vente — Caisse"
        subtitle="Vente directe au comptoir avec lecteur code-barres et impression ticket"
      />

      {/* Mobile Tab Switcher (Visible on screens <= 768px via media query) */}
      <div
        className="pos-mobile-tab-bar"
        style={{
          display: 'none',
          gap: '8px',
          marginBottom: '12px',
          width: '100%',
        }}
      >
        <button
          type="button"
          onClick={() => setMobileTab('catalog')}
          className={`btn ${mobileTab === 'catalog' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, padding: '8px 12px' }}
        >
          Articles ({filteredProducts.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('cart')}
          className={`btn ${mobileTab === 'cart' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, padding: '8px 12px' }}
        >
          Panier ({totalItemCount}) • {formatCurrency(total)}
        </button>
      </div>

      <div className="pos-layout-row" style={{ display: 'flex', flex: 1, minHeight: 0, gap: '16px', width: '100%' }}>
        {/* Left: Products Catalog & Search */}
        <div
          className={`pos-catalog-panel ${mobileTab === 'cart' ? 'hide-on-mobile' : ''}`}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            padding: 'var(--space-4)',
            overflowY: 'hidden',
          }}
        >
          {/* Search bar & Collapsible Category Menu */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ flex: '1 1 200px', position: 'relative' }}>
              <input
                type="text"
                className="input"
                placeholder="Rechercher un article (nom, référence, code-barres)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ height: '42px', paddingLeft: '38px', width: '100%' }}
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Collapsible Category Button Dropdown */}
            <div ref={categoryRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="btn btn-secondary btn-sm"
                style={{
                  height: '42px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  whiteSpace: 'nowrap',
                  backgroundColor: selectedCategory ? '#eef5f3' : '#ffffff',
                  color: selectedCategory ? '#1e564d' : 'var(--color-text)',
                  border: selectedCategory ? '1px solid #1e564d' : '1px solid var(--color-border)',
                }}
              >
                <span>Catégorie : <strong>{categoryLabel}</strong></span>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{isCategoryOpen ? '▲' : '▼'}</span>
              </button>

              {/* Collapsible Category Panel containing ALL categories */}
              {isCategoryOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    width: 'min(320px, calc(100vw - 32px))',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 200,
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Sélectionner une catégorie ({categories.length})
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {/* Option All */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(null)
                        setIsCategoryOpen(false)
                      }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: selectedCategory === null ? 700 : 500,
                        backgroundColor: selectedCategory === null ? '#1e564d' : 'transparent',
                        color: selectedCategory === null ? '#ffffff' : 'var(--color-text)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>Toutes les catégories</span>
                      <span style={{ fontSize: '11px', opacity: 0.8 }}>({products.length})</span>
                    </button>

                    {/* Category List */}
                    {categories.map((cat) => {
                      const count = products.filter((p) => p.category_id === cat.id).length
                      const isSelected = selectedCategory === cat.id
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.id)
                            setIsCategoryOpen(false)
                          }}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            textAlign: 'left',
                            fontSize: '13px',
                            fontWeight: isSelected ? 700 : 500,
                            backgroundColor: isSelected ? '#1e564d' : '#f8faf9',
                            color: isSelected ? '#ffffff' : 'var(--color-text)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span>{cat.name}</span>
                          <span style={{ fontSize: '11px', opacity: 0.8 }}>({count})</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Cards Grid: Fluid Auto-Fit Grid */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <div className="spinner"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-dim)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text)' }}>Aucun article trouvé</h3>
                <p style={{ fontSize: '13px' }}>Modifiez vos critères de recherche ou sélectionnez une autre catégorie.</p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(160px, 22vw, 240px), 1fr))',
                  gap: 'clamp(10px, 1.5vw, 16px)',
                  paddingBottom: '20px',
                }}
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p) => addToCart(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart & Checkout Panel */}
        <div
          className={`pos-cart-panel ${mobileTab === 'catalog' ? 'hide-on-mobile' : ''}`}
          style={{ height: '100%' }}
        >
          <Cart
            onCheckout={() => setIsPaymentOpen(true)}
          />
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={total}
        onConfirmSale={handleConfirmSale}
        isSubmitting={isSubmitting}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={lastSale}
      />
    </div>
  )
}
