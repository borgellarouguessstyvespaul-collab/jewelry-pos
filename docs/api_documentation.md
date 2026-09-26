# Documentation de l'API REST — Jewelry POS

## Authentification
Tous les points de terminaison protégés requièrent l'en-tête HTTP suivant :
```
Authorization: Bearer <ACCESS_TOKEN>
```

---

## 1. Authentification (`/api/auth`)
- `POST /api/auth/login` : Authentification utilisateur (`{ email, password }`). Retourne le JWT token.
- `GET /api/auth/me` : Profil de l'utilisateur connecté.
- `POST /api/auth/logout` : Clôture de la session.

---

## 2. Produits & Bijoux (`/api/products`)
- `GET /api/products/` : Liste paginée des bijoux (paramètres: `search`, `category_id`, `is_active`).
- `GET /api/products/{id}` : Fiche détaillée d'un bijou.
- `GET /api/products/barcode/{barcode}` : Recherche ultra-rapide par code-barres pour le scanner.
- `POST /api/products/` : Création d'un bijou (`ADMIN`, `GESTIONNAIRE`).
- `PUT /api/products/{id}` : Mise à jour des caractéristiques, prix, alertes (`ADMIN`, `GESTIONNAIRE`).
- `DELETE /api/products/{id}` : Désactivation d'un bijou (`ADMIN`).

---

## 3. Caisse & Ventes (`/api/sales`)
- `POST /api/sales/` : Enregistrement et finalisation d'une transaction de vente.
  ```json
  {
    "items": [
      { "product_id": 1, "quantity": 1, "unit_price": 2450.00 }
    ],
    "customer_id": 2,
    "discount": 50.00,
    "amount_received": 2400.00,
    "payment_method": "CASH",
    "notes": "Paiement comptoir"
  }
  ```
- `GET /api/sales/` : Historique des ventes avec filtres de statut et date.
- `GET /api/sales/{id}` : Détails d'une vente et lignes d'articles.
- `POST /api/sales/{id}/cancel` : Annulation d'une vente et restitution du stock (`ADMIN`).

---

## 4. Stocks & Mouvements (`/api/stock`)
- `GET /api/stock/` : Niveaux de stock actuels de tous les articles.
- `GET /api/stock/low` : Liste des articles sous le seuil d'alerte.
- `POST /api/stock/adjust` : Ajustement de stock (`IN`, `OUT`, `ADJUSTMENT`, `RETURN`, `DAMAGE`).
- `GET /api/stock/movements` : Journal complet des flux d'entrées/sorties.

---

## 5. Clients & CRM (`/api/customers`)
- `GET /api/customers/` : Recherche et liste des clients.
- `GET /api/customers/{id}` : Historique et fiche d'un client.
- `POST /api/customers/` : Enregistrement d'un nouveau client.
- `PUT /api/customers/{id}` : Mise à jour des coordonnées.

---

## 6. Rapports Financiers (`/api/reports`)
- `GET /api/reports/dashboard` : Indicateurs clés (ventes du jour, alertes stock, nombre de bijoux).
- `GET /api/reports/sales` : Rapports sur périodes (`daily`, `weekly`, `monthly`).
- `GET /api/reports/products` : Classement des bijoux les plus vendus.
- `GET /api/reports/stock` : Valorisation globale de l'inventaire en magasin.

---

## 7. Journal d'Audit (`/api/audit`)
- `GET /api/audit/` : Journal des actions critiques avec horodatage, utilisateur et adresse IP (`ADMIN`).
