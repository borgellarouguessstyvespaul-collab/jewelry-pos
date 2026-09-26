export function formatCurrency(amount, currency = 'HTG') {
  if (amount === null || amount === undefined || isNaN(amount)) return '0.00 HTG'
  const num = Number(amount)
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${formatted} ${currency}`
}

export function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatWeight(weightInGrams) {
  if (!weightInGrams && weightInGrams !== 0) return '-'
  return `${Number(weightInGrams).toFixed(2)} g`
}

export function formatCarat(carats) {
  if (!carats && carats !== 0) return '-'
  return `${Number(carats).toFixed(2)} ct`
}
