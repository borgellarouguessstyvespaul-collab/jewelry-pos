# Guide de Déploiement en Production — Jewelry POS

## 1. Déploiement avec Docker & Docker Compose (Recommandé)

Le projet inclut un fichier `docker-compose.yml` prêt à l'emploi qui configure :
- La base de données PostgreSQL
- L'API FastAPI Backend
- Le Frontend React / Vite compilé sous NGINX

### Lancement en une commande :
```bash
docker-compose up -d --build
```

### Initialisation et peuplement de la base :
```bash
docker-compose exec backend python database/seeds/seed_data.py
```

L'application est immédiatement accessible :
- **Frontend POS** : `http://localhost:80` ou `http://localhost:5173`
- **Backend API & Swagger Docs** : `http://localhost:8000/docs`

---

## 2. Déploiement Local / Manuel

### Prérequis :
- Python 3.10+
- Node.js 18+ & npm
- PostgreSQL (ou SQLite pour environnement de test)

### Configuration Backend :
```bash
cd backend
python -m venv venv
# Activer l'environnement (Windows)
.\venv\Scripts\activate
# Installer les dépendances
pip install -r requirements.txt
# Configurer les variables d'environnement
copy .env.example .env
# Lancer le serveur FastAPI
python run.py
```

### Configuration Frontend :
```bash
cd frontend
npm install
npm run build # Pour la production
# ou
npm run dev   # Pour le développement local
```

---

## 3. Sauvegardes de la Base de Données (Backup)

Script automatisé de sauvegarde PostgreSQL recommandé :
```bash
pg_dump -U postgres -d jewelry_pos_db > backup_$(date +%Y%m%d_%H%M%S).sql
```
Il est conseillé de planifier une tâche Cron ou une tâche planifiée Windows (Task Scheduler) quotidienne pour sauvegarder la base de données après la fermeture de la bijouterie.
