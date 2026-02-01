# Chat aplikacija 

## 🚀 O Projektu
Chat aplikacija omogućava korisnicima:
- Real-time razmenu poruka putem Socket.IO
- Deljenje slika, dokumenata i GIF-ova
- Kreiranje grupnih chat-ova
- Prijavu neprikladnog sadržaja

## 🛠 Tehnologije

### Backend
- *Node.js* + *Express.js* - Server framework
- *TypeScript* - Type safety
- *TypeORM* - ORM za SQLite/PostgreSQL
- *Socket.IO* - Real-time komunikacija
- *JWT* - Autentifikacija
- *Nodemailer* - Email servisi

### Frontend
- *Next.js 14* - React framework
- *TypeScript* - Type safety
- *Tailwind CSS* - Styling
- *Socket.IO Client* - Real-time
- *React Hook Form* + *Zod* - Validacija
- *Axios* - HTTP klijent

### DevOps
- *Docker* + *Docker Compose* - Kontejnerizacija
- *GitHub Actions* - CI/CD
- *Swagger* - API dokumentacija

---

## ✨ Funkcionalnosti

### 👤 Korisnici
- ✅ Registracija i prijava
- ✅ Resetovanje lozinke putem email-a
- ✅ Korisnički profili
- ✅ Kreiranje grupnih i privatnih chatova
- ✅ Slanje i primanje poruka
- ✅ Online/offline status

### 💬 Poruke
- ✅ Real-time slanje poruka
- ✅ Izmena i brisanje poruka
- ✅ Deljenje slika, dokumenata
- ✅ GIF-ovi putem Giphy API-ja
- ✅ Emoji picker

### 👥 Grupni chat-ovi
- ✅ Kreiranje grupa
- ✅ Dodavanje/uklanjanje članova
- ✅ Admin/moderator uloge

### 🛡 Sigurnost
- ✅ JWT autentifikacija
- ✅ HttpOnly cookies (CSRF zaštita)
- ✅ Input validacija (XSS zaštita)
- ✅ TypeORM (SQL Injection zaštita)
- ✅ CORS konfiguracija
- ✅ Rate limiting

---

## 🌐 Eksterni API-ji

| *Cloudinary* | Upload i hosting fajlova 
| *Giphy* | GIF pretraga i deljenje gifova
| *Gmail SMTP* | Slanje email-ova 

---
## 🔒 Bezbednost

Aplikacija implementira zaštitu od sledećih napada:

### 1. *CSRF (Cross-Site Request Forgery)*
- HttpOnly cookies koji ne mogu biti pristupljeni JavaScript-om
- SameSite cookie atribut

### 2. *XSS (Cross-Site Scripting)*
- Input validacija sa Zod schema
- Sanitizacija korisničkih unosa
- Content Security Policy headers

### 3. *SQL Injection*
- TypeORM koristi parametrizovane upite
- Automatsko escaping korisničkih unosa

### 4. *CORS*
- Whitelist dozvoljenih origin-a
- Credentials omogućeni samo za frontend

### 5. *IDOR (Insecure Direct Object References)*
- Autentifikacija i autorizacija na svim rutama
- Provera vlasništva nad resursima

---

## 🚀 Pokretanje Aplikacije

### Preduslov
- Node.js 18+
- Docker & Docker Compose
- Git

### 1. Kloniraj Repo
bash
git clone https://github.com/elab-development/internet-tehnologije-2025-chataplikacija_2022_0376.git
cd internet-tehnologije-2025-chataplikacija_2022_0376

### 2. Environment Variables

*Backend (.env):*
bash
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=chat_db

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SMTP (Gmail)
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password

*Frontend (.env.local):*
bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000
NEXT_PUBLIC_GIPHY_API_KEY=your-giphy-key

### 3. Pokreni sa Docker Compose
bash
docker-compose up --build

### 4. Alternativno - Lokalno pokretanje

*Backend:*
bash
cd backend
npm install
npm run dev


*Frontend:*
bash
cd frontend
npm install
npm run dev


### 5. Pristupi aplikaciji
- *Frontend*: http://localhost:3000
- *Backend*: http://localhost:5000
- *API Docs*: http://localhost:5000/api-docs
- *Health Check*: http://localhost:5000/health

---

## 📚 API Dokumentacija

Swagger dokumentacija je dostupna na:
http://localhost:5000/api-docs

---

## 🧪 Testiranje

### Unit testovi
bash
cd backend
npm run test


### Integration testovi
bash
npm run test:integration


### E2E testovi (Cypress)
bash
cd frontend
npm run cypress:open

---

### Workflow
bash
# Kreiraj feature branch
git checkout develop
git pull origin develop
git checkout -b feature/nova-funkcionalnost

# Commit-uj promene
git add .
git commit -m "feat: dodao novu funkcionalnost"

# Push i kreiraj Pull Request
git push origin feature/nova-funkcionalnost

---

## 📊 CI/CD Pipeline

GitHub Actions automatski:
1. ✅ Pokreće testove
2. ✅ Gradi Docker image
3. ✅ Push-uje na Docker Hub
4. ✅ Deploy-uje na Cloud
.github/workflows/ci-cd.yml

