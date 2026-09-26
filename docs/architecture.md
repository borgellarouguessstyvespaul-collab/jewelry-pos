# Architecture du Système — Jewelry POS

## 1. Vue d'Ensemble
Jewelry POS est un système de point de vente et de gestion d'inventaire complet spécialement conçu pour les bijouteries haut de gamme (or, diamants, montres, métaux précieux).

```
+-------------------------------------------------------+
|                   FRONTEND (React + Vite)             |
|   - Interface de Vente (POS)                         |
|   - Gestionnaire Panier (CartContext)                |
|   - Détecteur Scanner Code-barres (useBarcode)        |
|   - Impression Reçus Thermiques 80mm                  |
|   - Tableaux de bord & Rapports                       |
+---------------------------+---------------------------+
                            |
                     REST API / JWT
                            |
+---------------------------v---------------------------+
|                   BACKEND (FastAPI + Python)          |
|   - /api/auth       : Connexion, JWT, Rôles           |
|   - /api/products   : Catalogue, Métaux, Carats       |
|   - /api/stock      : Mouvements, Alertes de rupture  |
|   - /api/sales      : Transaction ACID, Calculs       |
|   - /api/customers  : Gestion clientèle & CRM         |
|   - /api/reports    : Chiffre d'affaires & Marges     |
|   - /api/audit      : Traçabilité immuable            |
+---------------------------+---------------------------+
                            |
                        SQLAlchemy
                            |
+---------------------------v---------------------------+
|               BASE DE DONNÉES (PostgreSQL / SQLite)   |
|   - Tables: users, categories, products, sales,      |
|             sale_items, stock_movements, customers,   |
|             audit_logs                                |
+-------------------------------------------------------+
```

## 2. Sécurité & Contrôle d'Accès
Le système dispose de trois niveaux de permissions (`UserRole`) :
1. **ADMIN** : Accès total — gestion des utilisateurs, journal d'audit de sécurité, annulation des ventes, rapports globaux.
2. **GESTIONNAIRE** : Gestion du catalogue, réceptions de marchandises, ajustements de stocks, consultation des rapports.
3. **CAISSIER** : Encaissement au comptoir, recherche code-barres, consultation catalogue, fiches clients.

## 3. Gestion des Transactions & Intégrité Stock
Chaque vente est traitée au sein d'une transaction atomique (ACID) :
- Vérification de la disponibilité du stock pour chaque article.
- Déduction immédiate de la quantité vendue.
- Enregistrement d'un mouvement de stock automatique (`MovementType.SALE`).
- Génération d'un numéro de ticket unique et traçable (`TKT-YYYYMMDD-XXXX`).
- Journalisation d'un audit de sécurité.
