import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/formatters'

export default function Cart({ onCheckout }) {
  const {
    items,
    updateQuantity,
    updateDiscount,
    removeFromCart,
    clearCart,
    subtotal,
    totalDiscount,
    globalDiscount,
    setGlobalDiscount,
    total,
    itemCount,
  } = useCart()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}
    >
      {/* Cart Header */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
            Panier Actuel ({itemCount})
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>
            Vente en cours
          </span>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--color-danger)' }}
          >
            Vider
          </button>
        )}
      </div>


      {/* Cart Items List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-3)' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)', color: 'var(--color-text-dim)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}></div>
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>Le panier est vide</p>
            <small>Scannez un code-barres ou sélectionnez un article</small>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((item) => (
              <div
                key={item.product.id}
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, marginRight: '8px' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text)' }}>
                      {item.product.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>
                      {formatCurrency(item.unit_price)} l'unité
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-accent-light)' }}>
                      {formatCurrency(item.subtotal)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-danger)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                {/* Quantity and Discount Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '26px', height: '26px', padding: 0, justifyContent: 'center' }}
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 600, fontSize: '13px' }}>
                      {item.quantity}
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '26px', height: '26px', padding: 0, justifyContent: 'center' }}
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>Remise HTG:</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.discount || ''}
                      placeholder="0"
                      onChange={(e) => updateDiscount(item.product.id, e.target.value)}
                      style={{
                        width: '55px',
                        padding: '3px 6px',
                        fontSize: '11px',
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary & Checkout */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: 'var(--space-4)', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
            <span>Sous-total:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)' }}>
            <span>Remise Globale (HTG):</span>
            <input
              type="number"
              min="0"
              step="1"
              value={globalDiscount || ''}
              placeholder="0.00"
              onChange={(e) => setGlobalDiscount(Math.max(0, Number(e.target.value)))}
              style={{
                width: '75px',
                padding: '3px 6px',
                fontSize: '12px',
                textAlign: 'right',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text)',
              }}
            />
          </div>

          {totalDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)' }}>
              <span>Total Réductions:</span>
              <span>-{formatCurrency(totalDiscount)}</span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: 'var(--color-text)',
              paddingTop: '6px',
              borderTop: '1px solid var(--color-border)',
              marginTop: '4px',
            }}
          >
            <span>TOTAL:</span>
            <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(total)}</span>
          </div>
        </div>

        <button
          disabled={items.length === 0}
          onClick={onCheckout}
          className="btn btn-primary btn-lg"
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 700,
            borderRadius: '9999px',
          }}
        >
          Encaisser ({formatCurrency(total)})
        </button>
      </div>
    </div>
  )
}
