import { createContext, useContext, useState, useMemo } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [customer, setCustomer] = useState(null)
  const [globalDiscount, setGlobalDiscount] = useState(0) // percentage or fixed
  const [taxRate, setTaxRate] = useState(0) // Default 0 or configurable

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id)
      if (existingIndex > -1) {
        const updated = [...prev]
        const newQty = updated[existingIndex].quantity + qty
        if (newQty > product.stock_quantity) {
          alert(`Quantité en stock insuffisante (${product.stock_quantity} disponible)`)
          return prev
        }
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          subtotal: newQty * updated[existingIndex].unit_price - updated[existingIndex].discount,
        }
        return updated
      } else {
        if (qty > product.stock_quantity) {
          alert(`Quantité en stock insuffisante (${product.stock_quantity} disponible)`)
          return prev
        }
        const unit_price = Number(product.price)
        return [
          ...prev,
          {
            product,
            quantity: qty,
            unit_price,
            discount: 0,
            subtotal: qty * unit_price,
          },
        ]
      }
    })
  }

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId)
      return
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          if (qty > item.product.stock_quantity) {
            alert(`Quantité en stock max: ${item.product.stock_quantity}`)
            return item
          }
          return {
            ...item,
            quantity: qty,
            subtotal: qty * item.unit_price - item.discount,
          }
        }
        return item
      })
    )
  }

  const updateDiscount = (productId, discountVal) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const discount = Math.max(0, Number(discountVal) || 0)
          return {
            ...item,
            discount,
            subtotal: Math.max(0, item.quantity * item.unit_price - discount),
          }
        }
        return item
      })
    )
  }

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const clearCart = () => {
    setItems([])
    setCustomer(null)
    setGlobalDiscount(0)
  }

  const calculations = useMemo(() => {
    const rawSubtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
    const itemDiscounts = items.reduce((sum, item) => sum + item.discount, 0)
    const subtotalAfterItemDiscounts = Math.max(0, rawSubtotal - itemDiscounts)
    const finalDiscount = itemDiscounts + Number(globalDiscount || 0)
    const taxableAmount = Math.max(0, rawSubtotal - finalDiscount)
    const tax = taxableAmount * (taxRate / 100)
    const total = taxableAmount + tax

    return {
      subtotal: rawSubtotal,
      totalDiscount: finalDiscount,
      tax,
      total,
      itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
    }
  }, [items, globalDiscount, taxRate])

  return (
    <CartContext.Provider
      value={{
        items,
        customer,
        setCustomer,
        globalDiscount,
        setGlobalDiscount,
        taxRate,
        setTaxRate,
        addToCart,
        updateQuantity,
        updateDiscount,
        removeFromCart,
        clearCart,
        ...calculations,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
