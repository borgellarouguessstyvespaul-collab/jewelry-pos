# 💎 Jewelry POS — Système de Point de Vente & Gestion de Bijouterie

Un système complet, moderne et performant de Point de Vente (POS) et de gestion d'inventaire conçu sur-mesure pour les bijouteries fines, joailleries et horlogeries de luxe.

---

## 🚀 Fonctionnalités Clés

- **💎 Caisse Enregistreuse (POS)** :
  - Recherche ultra-rapide par nom, catégorie ou code-barres.
  - Détection automatique des **scanners code-barres USB & Bluetooth** (mode HID, frappes rapides).
  - Gestion du panier dynamique (quantités, remises par article ou globales).
  - Prise en charge des moyens de paiement multiples : Espèces, Cartes Bancaires, Virements / MonCash.
  - Calcul automatique de la monnaie à rendre et raccourcis de coupures rapides.
  - **Impression instantanée de tickets de caisse thermiques (80mm & 58mm)** avec ouverture automatique du tiroir-caisse.

- **💍 Gestion du Catalogue de Bijoux** :
  - Attributs spécialisés pour la joaillerie : Type de métal (Or 18K, 24K, Argent 925, Platine), pureté, poids en grammes, carats (ct), pierres précieuses.
  - Codes-barres / SKU uniques par bijou.
  - Gestion des marges et prix de revient (coût d'achat vs prix de vente).

- **📦 Gestion des Stocks & Alertes de Rupture** :
  - Niveaux de stocks en temps réel avec seuils d'alerte configurables.
  - Traçabilité complète des mouvements : Entrées fournisseurs, sorties, ajustements d'inventaire, pertes/casse, retours clients.

- **📊 Tableau de Bord & Rapports Financiers** :
  - Chiffre d'affaires du jour, de la semaine et du mois.
  - Top 10 des bijoux les plus vendus et les plus rentables.
  - Valorisation totale du stock en magasin.

- **👥 CRM & Gestion Clientèle** :
  - Fiches clients avec coordonnées, historique d'achats et préférences de bijoux (tour de doigt, or préféré).

- **🛡️ Sécurité & Journal d'Audit** :
  - Authentification JWT avec rôles stricts : `ADMIN`, `GESTIONNAIRE`, `CAISSIER`.
  - Journal d'audit inviolable consignant toutes les actions sensibles avec horodatage et adresse IP.

---

## 🛠️ Stack Technologique

| Couche | Technologie |
|---|---|
| **Frontend** | React 18, Vite, React Router 6, Axios, Design System CSS Personnalisé (Dark Mode Luxe) |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy 2.0, Pydantic v2, PyJWT / Passlib (Bcrypt) |
| **Base de Données** | PostgreSQL 15 (ou SQLite pour développement local léger) |
| **Hardware** | Lecteur de code-barres USB/Bluetooth, Imprimantes thermiques ESC/POS 80mm/58mm |
| **Déploiement** | Docker, Docker Compose, NGINX |

---

## 📁 Structure du Projet

```
jewelry-pos/
├── backend/
│   ├── app/
│   │   ├── api/            # Routes REST FastAPI (auth, products, sales, stock, etc.)
│   │   ├── core/           # Configuration, Base de données, Sécurité, Permissions
│   │   ├── dependencies/   # Dépendances FastAPI (Auth, DB session)
│   │   ├── models/         # Modèles SQLAlchemy (User, Product, Sale, Stock, etc.)
│   │   ├── schemas/        # Schémas de validation Pydantic
│   │   ├── services/       # Logique métier & transactions atomiques
│   │   ├── utils/          # Code-barres, reçus thermiques, validateurs
│   │   └── main.py         # Point d'entrée de l'application FastAPI
│   ├── tests/              # Tests unitaires et d'intégration
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/     # Composants modulaires (POS, Cart, Modals, Layout)
│   │   ├── context/        # Contextes React (AuthContext, CartContext)
│   │   ├── hooks/          # Hooks personnalisés (useAuth, useCart, useBarcode)
│   │   ├── pages/          # Pages de l'application (POS, Dashboard, Products, etc.)
│   │   ├── routes/         # Routage protégé par rôle
│   │   ├── services/       # Clients API Axios
│   │   ├── utils/          # Formateurs de monnaie/poids, impression reçu
│   │   └── index.css       # Système de design global
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── database/
│   ├── migrations/         # Migrations Alembic
│   └── seeds/              # Script de données initiales (seed_data.py)
├── docs/                   # Documentation technique, architecture & matériel
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## 🚀 Démarrage Rapide

### 1. Avec Docker Compose (Recommandé)

```bash
# 1. Cloner ou se placer dans le projet
cd jewelry-pos

# 2. Lancer les conteneurs
docker-compose up -d --build

# 3. Initialiser les données de démonstration
docker-compose exec backend python database/seeds/seed_data.py
```

- **Accès Frontend** : `http://localhost`
- **Documentation API (Swagger)** : `http://localhost:8000/docs`

---

### 2. Démarrage Local (Sans Docker)

#### Backend :
```bash
cd backend
python -m venv venv
# Windows :
.\venv\Scripts\activate
# Linux/Mac :
# source venv/bin/activate

pip install -r requirements.txt
python run.py
```
Le serveur démarrera sur `http://localhost:8000`.

#### Peuplement de la base de données :
```bash
python database/seeds/seed_data.py
```

#### Frontend :
```bash
cd frontend
npm install
npm run dev
```
L'interface de caisse s'ouvrira sur `http://localhost:5173`.

---

## 🔑 Identifiants de Démonstration

| Rôle | Email | Mot de passe | Accès |
|---|---|---|---|
| **Administrateur** | `admin` (ou `admin@jewelrypos.com`) | `admin12345` | Caisse, Stock, Rapports, Utilisateurs, Audit |
| **Gestionnaire** | `manager@jewelrypos.com` | `manager123` | Caisse, Stock, Catalogue Bijoux, Rapports |
| **Caissier** | `caissier@jewelrypos.com` | `caissier123` | Caisse / POS, Catalogue, Clients |

---

## 📄 Licence
Propriétaire — Conçu pour la gestion moderne de bijouteries.
