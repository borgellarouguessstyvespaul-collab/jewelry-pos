import { formatCurrency, formatWeight, formatCarat } from '../../utils/formatters'

export default function ProductCard({ product, onAddToCart }) {
  const isOutOfStock = (product.stock_quantity ?? 0) <= 0
  const isLowStock = (product.stock_quantity ?? 0) > 0 && (product.stock_quantity ?? 0) < 5

  return (
    <div
      className={`card product-card ${isOutOfStock ? 'disabled' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '18px',
        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
        opacity: isOutOfStock ? 0.5 : 1,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
      }}
      onClick={() => {
        if (!isOutOfStock) onAddToCart(product)
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <span className="badge" style={{ fontSize: '10px', backgroundColor: 'rgba(30, 86, 77, 0.1)', color: 'var(--color-primary)', border: '1px solid rgba(30,86,77,0.2)' }}>
            {product.category?.name || 'Article'}
          </span>
          {isOutOfStock ? (
            <span className="badge" style={{ backgroundColor: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb', fontWeight: 700 }}>
              Épuisé (0)
            </span>
          ) : isLowStock ? (
            <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontWeight: 700 }}>
              Reste: {product.stock_quantity}
            </span>
          ) : (
            <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', fontWeight: 700 }}>
              En Stock
            </span>
          )}
        </div>

        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px', lineHeight: 1.3, color: 'var(--color-text)' }}>
          {product.name}
        </h4>

        {product.sku && (
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '12px', fontFamily: 'monospace', fontWeight: 600 }}>
            {product.sku}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '11.5px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          {product.metal_type && <span style={{ background: 'var(--color-surface-2)', padding: '2px 6px', borderRadius: '4px' }}>{product.metal_type}</span>}
          {product.weight && <span style={{ background: 'var(--color-surface-2)', padding: '2px 6px', borderRadius: '4px' }}>{formatWeight(product.weight)}</span>}
          {product.carat && <span style={{ background: 'var(--color-surface-2)', padding: '2px 6px', borderRadius: '4px' }}>{formatCarat(product.carat)}</span>}
        </div>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--color-border-light)' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
          {formatCurrency(product.selling_price || product.price)}
        </span>
        <button
          disabled={isOutOfStock}
          className="btn btn-primary btn-sm"
          onClick={(e) => {
            e.stopPropagation()
            if (!isOutOfStock) onAddToCart(product)
          }}
          style={{ borderRadius: 'var(--radius-full)', padding: '6px 14px', fontSize: '12px', opacity: isOutOfStock ? 0.5 : 1 }}
        >
          + Ajouter
        </button>
      </div>
    </div>
  )
}
