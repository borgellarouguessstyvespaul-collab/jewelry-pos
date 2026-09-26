# 🚀 Guide Deplwayman a 0 : Neon (Database), Render (Backend), Vercel (Frontend)

Guide sa a eksplike etap pa etap ki jan pou w deplwaye **Jewelry POS** sou **Neon**, **Render**, ak **Vercel** san okenn erè.

---

## 1. 🗄️ Etap 1 : Baza de Done Neon (PostgreSQL)

1. Ale sou [neon.tech](https://neon.tech) epi kreye/ouvè yon kont.
2. Kreye yon nouvo projè (egzanp: `jewelry-pos-db`).
3. Kopye **Connection String** PostgreSQL la. Li sanble ak sa :
   `postgres://neondb_owner:votre_mot_de_passe@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

---

## 2. ⚙️ Etap 2 : Backend sou Render

1. Ale sou [render.com](https://render.com) epi klike **New +** -> **Web Service**.
2. Connecte depo GitHub ou an (`jewelry-pos`).
3. Rantre enfòmasyon sa yo :
   - **Name**: `jewelry-pos-backend` (oswa non ou vle a)
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Nan seksyon **Environment Variables** (Varisb d'environnement), ajoute :
   - `DATABASE_URL`: *(Kopye URL Neon an nèt)*
   - `SECRET_KEY`: `une_cle_secrete_tres_securisee_123`
   - `ENVIRONMENT`: `production`
5. Klike **Create Web Service**. Render ap deplwaye backend la epi ba w yon URL tankou `https://jewelry-pos-backend.onrender.com`.

---

## 3. 🌐 Etap 3 : Frontend sou Vercel

1. Ale sou [vercel.com](https://vercel.com) epi klike **Add New...** -> **Project**.
2. Enpòte depo GitHub ou an (`jewelry-pos`).
3. Rantre konfigirasyon sa yo :
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Nan seksyon **Environment Variables**, ajoute :
   - **Name**: `VITE_API_URL`
   - **Value**: `https://jewelry-pos-backend.onrender.com/api` *(Repons URL Render ou a ak `/api` nan fen an)*
5. Klike **Deploy**.

---

## 🔑 Idantifyan pa Defaut pou Premye Koneksyon

Lè backend la demare sou Neon pou premye fwa, li kreye otomatikman kont sa yo :

| Wòl | Email / Identifiant | Mot de Passe |
|---|---|---|
| **Admin** | `admin@jewelrypos.com` | `admin123` |
| **Gestionnaire** | `manager@jewelrypos.com` | `manager123` |
| **Caissier** | `caissier@jewelrypos.com` | `caissier123` |

---

## ✅ Tout bagay prè !
Kòd la genyen :
- Autoseed pou Neon DB.
- Fallback otomatik si DB gen yon ti pwoblèm.
- Retrait bouton kontak aksè rapid yo sou paj Login an.
