const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL
  if (!url) {
    if (import.meta.env.DEV) {
      return 'http://localhost:8080/api'
    }
    url = 'https://jewelry-pos-sfji.onrender.com/api'
  }
  url = url.trim().replace(/\/+$/, '')
  if (!url.endsWith('/api')) {
    url += '/api'
  }
  return url
}

export const API_BASE_URL = getApiBaseUrl()

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
}

export const PAYMENT_METHODS = [
  { id: 'CASH', label: 'Espèces (Cash)', icon: '💵' },
  { id: 'CARD', label: 'Carte Bancaire', icon: '💳' },
  { id: 'TRANSFER', label: 'Virement / MonCash / Natcash', icon: '📱' },
  { id: 'OTHER', label: 'Autre', icon: '🏷️' },
]

export const JEWELRY_METALS = ['Or 18K', 'Or 24K', 'Argent 925', 'Platine', 'Acier Inoxydable', 'Plaqué Or', 'Autre']

export const MOVEMENT_TYPES = {
  IN: 'Entrée (Achat / Réception)',
  OUT: 'Sortie',
  ADJUSTMENT: 'Ajustement Inventaire',
  SALE: 'Vente',
  RETURN: 'Retour Client',
  DAMAGE: 'Perte / Casse',
}
