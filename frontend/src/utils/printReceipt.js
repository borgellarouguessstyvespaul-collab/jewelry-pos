import { formatCurrency, formatDate } from './formatters'

/**
 * Open a pop-up print window designed like the modern receipt card with just the product name(s).
 */
export function printReceipt(sale, storeInfo = {}) {
  const store = {
    name: 'KISA BOUTIQUE',
    footer: 'Merci pour votre achat.',
    ...storeInfo,
  }

  const printWindow = window.open('', '_blank', 'width=420,height=650')
  if (!printWindow) {
    alert('Veuillez autoriser les fenêtres pop-up pour imprimer le reçu.')
    return
  }

  const items = sale.items || sale.sale_items || []
  const itemsHtml = items
    .map((item) => {
      const name = item.product_name || item.name || item.product?.name || `Produit #${item.product_id}`
      const qty = item.quantity > 1 ? ` (x${item.quantity})` : ''
      const lineTotal =
        item.subtotal ||
        item.total_price ||
        (item.quantity && item.unit_price ? item.quantity * item.unit_price : null)
      return `
        <div class="product-row">
          <span class="product-name">${name}${qty}</span>
          ${lineTotal != null ? `<span class="product-price">${formatCurrency(lineTotal)}</span>` : ''}
        </div>
      `
    })
    .join('')

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Ticket ${sale.sale_number || sale.id}</title>
      <style>
        @page {
          margin: 4mm;
          size: 80mm 80mm;
        }
        @media print {
          @page {
            size: 80mm 80mm;
            margin: 0;
          }
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          width: 78mm;
          margin: 0 auto;
          padding: 12px 8px;
          color: #1e293b;
          background: #ffffff;
          font-size: 13px;
          line-height: 1.4;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .header {
          text-align: center;
          margin-bottom: 14px;
        }
        .store-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 4px;
        }
        .sale-title {
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .sale-date {
          font-size: 12px;
          color: #64748b;
        }
        .products-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 14px;
          margin-bottom: 12px;
        }
        .products-header {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          margin-bottom: 6px;
        }
        .product-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
          border-bottom: 1px dashed #e2e8f0;
        }
        .product-row:last-child {
          border-bottom: none;
        }
        .product-name {
          font-weight: 600;
          color: #1e293b;
          font-size: 13px;
        }
        .product-price {
          font-size: 12px;
          color: #475569;
          font-weight: 500;
        }
        .summary-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 14px;
        }
        .card-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .card-row:last-child {
          margin-bottom: 0;
        }
        .card-label {
          color: #64748b;
        }
        .total-value {
          font-weight: 800;
          font-size: 15px;
          color: #1e564d;
        }
        .received-value {
          font-weight: 600;
          color: #1e293b;
        }
        .change-value {
          font-weight: 800;
          font-size: 14px;
          color: #16a34a;
        }
        .badge-payment {
          background: #e0f2fe;
          color: #0369a1;
          padding: 3px 12px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.05em;
        }
        .footer {
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="store-badge">${store.name}</div>
        <div class="sale-title">Vente N° ${sale.sale_number || sale.id}</div>
        <div class="sale-date">${formatDate(sale.created_at || new Date())}</div>
      </div>

      ${
        items.length > 0
          ? `
      <div class="products-box">
        <div class="products-header">Articles</div>
        ${itemsHtml}
      </div>
      `
          : ''
      }

      <div class="summary-card">
        <div class="card-row">
          <span class="card-label">Total Vente:</span>
          <span class="total-value">${formatCurrency(sale.total || sale.final_amount || sale.total_amount)}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Montant Reçu:</span>
          <span class="received-value">${formatCurrency(sale.amount_received ?? sale.amount_paid ?? sale.total)}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Monnaie Rendue:</span>
          <span class="change-value">${formatCurrency(sale.change_amount ?? sale.change_due ?? 0)}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Paiement:</span>
          <span class="badge-payment">${sale.payment_method || 'CASH'}</span>
        </div>
      </div>

      <div class="footer">
        <p>${store.footer}</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        };
      </script>
    </body>
    </html>
  `

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
