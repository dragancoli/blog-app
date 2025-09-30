# BlogApp (React Native + Node/Express + PostgreSQL)

Full‑stack mobilna i web aplikacija za blogovanje: korisnici se registruju, prijavljuju, kreiraju, uređuju i brišu postove, pregledaju detalje, ostavljaju komentare (uključujući odgovore), sve uz JWT autentifikaciju i tamnu/svetlu temu.

---

## Sadržaj

- [Funkcionalnosti](#funkcionalnosti)
- [Tehnologije](#tehnologije)
- [Struktura projekta](#struktura-projekta)
- [Instalacija i pokretanje](#instalacija-i-pokretanje)
  - [1. Kloniranje](#1-kloniranje)
  - [2. Backend - instalacija](#2-backend---instalacija)
  - [3. Baza podataka](#3-baza-podataka)
  - [4. .env konfiguracija (backend)](#4-env-konfiguracija-backend)
  - [5. Pokretanje backend-a](#5-pokretanje-backend-a)
  - [6. Frontend (React Native / Expo)](#6-frontend-react-native--expo)
- [API pregled](#api-pregled)
  - [Autentifikacija](#autentifikacija)
  - [Postovi](#postovi)
  - [Komentari](#komentari)
- [JWT detalji](#jwt-detalji)
- [Teme (Light / Dark)](#teme-light--dark)
- [Validacije & Bezbednost](#validacije--bezbednost)
- [Potencijalna unapređenja](#potencijalna-unapređenja)
- [Troubleshooting](#troubleshooting)

---

## Funkcionalnosti

### Backend
- Registracija / prijava (JWT, bcrypt hash lozinke)
- CRUD nad postovima (autorizacija za izmenu/brisanje)
- Komentari sa podrškom za odgovore (parent_id)
- Automatski timestamp-ovi (created_at / updated_at preko trigger-a)
- Validacija vlasništva resursa
- Modularne Express rute

### Frontend (React Native + react-native-paper)
- Prijava / registracija ekran
- Lista postova 
- Kreiranje novog posta
- Uređivanje i brisanje sopstvenih postova
- Detaljan prikaz posta
- Sekcija komentara (dodavanje, reply, izmena, brisanje)
- Dinamička tema (light / dark) prema sistemskim podešavanjima
- Pretraga postova 

---

## Tehnologije

| Sloj | Tehnologije |
|------|-------------|
| Backend | Node.js, Express.js, PostgreSQL, bcrypt, jsonwebtoken |
| Frontend | React Native, react-native-paper, AsyncStorage |
| Auth | JWT (HTTP header: `x-auth-token`) |
| Stilovi | React Native StyleSheet + Paper theming |
| Ostalo | Axios (HTTP), jwt-decode |

---

## Struktura projekta (primer)

```
root/
  server/
    src/
      config/
        db.js
      controllers/
        authController.js
        postController.js
        commentController.js
      middleware/
        authMiddleware.js
      routes/
        authRoutes.js
        postRoutes.js
        commentRoutes.js
      index.js
    package.json
    .env (lokalno – ne commitovati)
  app/          
    api/
      auth.js
      posts.js
      comments.js
    screens/
      LoginScreen.js
      RegisterScreen.js
      HomeScreen.js
      CreatePostScreen.js
      EditPostScreen.js
      PostDetailScreen.js
    components/
      CommentsSection.js (ako se koristi)
    context/
      AuthContext.js
    navigation/
      AppNavigator.js
    theme.js (ako postoji)
    App.js
    package.json
    index.js
  .gitignore
```

---

## Instalacija i pokretanje

### 1. Kloniranje

```bash
git clone https://github.com/dragancoli/blog-app.git
cd blog-app
```

### 2. Backend - instalacija

```bash
cd server
npm install
```

### 3. Baza podataka

Kreiraj PostgreSQL bazu (npr. `blog-app`). Naziv i detalje baze potrebno podesiti u .env fajlu. 
Za kreiranje baze potrebno je pokrenuti skripte za kreiranje svih tabela, procedura i trigera.

### 4. .env konfiguracija (backend)

Kreiraj `server/.env` fajl:

```
DB_USER=NazivPostgresKorisnika
DB_HOST=localhost (ili ip adresa)
DB_DATABASE=blog_db (Naziv baze ukoliko je promenjen pri kreiranju)
DB_PASSWORD=LozinkaPostgresKorisnika
DB_PORT=5432 (ili neki drugi port za bazu)
JWT_SECRET=LozinkaZaJWT
```

Primer `db.js` treba da koristi ove varijable (npr. `pg` Pool).

### 5. Pokretanje backend-a

```bash
npm run dev     # ako koristiš nodemon
# ili
node src/index.js
```

Server sluša na: `http://localhost:3000`

### 6. Frontend (React Native / Expo)

U drugom terminalu:

```bash
cd ../app
npm install
```

Proveri da u `api/*.js` fajlovima IP odgovara mreži uređaja (npr. `http://192.168.x.x:3000`).  
Za test na fizičkom telefonu (Expo Go) – koristi lokalnu LAN IP mašine (ne 127.0.0.1).

Pokretanje (Expo):
```bash
npm start
# ili
npx expo start
```

---

## API pregled

### Autentifikacija

| Metod | Ruta | Opis | Body |
|-------|------|------|------|
| POST | /api/auth/register | Registracija | `{ "username","email","password" }` |
| POST | /api/auth/login | Login | `{ "email","password" }` |

Odgovor (oba):  
```json
{ "token": "JWT_TOKEN_STRING" }
```

Header za zaštićene rute:
```
x-auth-token: <JWT>
```

### Postovi

| Metod | Ruta | Autorizacija | Opis |
|-------|------|--------------|------|
| GET | /api/posts | Ne | Lista postova |
| GET | /api/posts/:id | Ne | Detalj posta |
| POST | /api/posts | Da | Kreiranje |
| PUT | /api/posts/:id | Autor | Izmena |
| DELETE | /api/posts/:id | Autor | Brisanje |

Primer kreiranja:
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "x-auth-token: TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Prvi post","content":"Ovo je sadržaj."}'
```

### Komentari

| Metod | Ruta | Autorizacija | Opis |
|-------|------|--------------|------|
| GET | /api/posts/:postId/comments?mode=tree | Ne | Lista komentara (flat ili tree) |
| POST | /api/posts/:postId/comments | Da | Novi komentar / reply |
| PUT | /api/comments/:id | Autor komentara | Izmena |
| DELETE | /api/comments/:id | Autor komentara | Brisanje |

Kreiranje odgovora:
```bash
curl -X POST http://localhost:3000/api/posts/1/comments \
  -H "x-auth-token: TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Odgovor","parent_id":5}'
```

Tree izlaz vraća polje `depth` (ako je implementirano u kontroleru rekurzivnim CTE-om).

---

## JWT detalji

Payload tokena:
```json
{ "id": <user_id>, "iat": 123456789, "exp": 123456999 }
```

- Čuva se u AsyncStorage: `userToken`
- Slanje: `x-auth-token` header
- Na klijentu se dekodira `jwtDecode(userToken)` za identifikaciju vlasništva (post.author_id / comment.user_id)

---

## Teme (Light / Dark)

react-native-paper tema koristi sistemsku šemu:
- `useColorScheme()` -> bira light/dark
- Boje definisane u `theme.js`
- Ekrani (uključujući PostDetailScreen i EditPostScreen) koriste `useTheme()`
- Ne hard-kodirati boje; koristiti npr.:
  - `theme.colors.background`
  - `theme.colors.onBackground`
  - `theme.colors.primary`
  - `theme.colors.surfaceVariant`
  - `theme.colors.outline`

---

## Validacije & Bezbednost

| Sloj | Validacija |
|------|------------|
| Backend | Prazna polja (auth, posts, comments) |
| Backend | Vlasništvo nad resursima (author_id vs req.user.id) |
| Backend | Hash lozinke (bcrypt) |
| Backend | JWT verifikacija (authMiddleware) |
| Frontend | Onemogućavanje slanja praznih polja |
| Frontend | Fallback 'Nepoznato' za autora |

Dodatno moguće (trenutno nije implementirano):
- Rate limiting
- Brute force zaštita za login
- Sanitizacija sadržaja (ako se uvede rich text / markdown)
- Revocation lista za tokene (refresh token mehanizam)

---

## Potencijalna unapređenja

- Like / reakcije na postove i komentare
- Bookmark (“Sačuvaj”)
- Tagovi + filter
- Paginacija / infinite scroll (postovi i komentari)
- Profili korisnika (avatar, bio)
- Notifikacije (npr. novi komentar)
- Markdown / upload slika
- Admin panel (moderacija)
- i18n (sr/eng)
- Offline cache & optimistic UI
- Testovi (Jest / Detox)

---

## Troubleshooting

| Problem | Uzrok | Rešenje |
|---------|-------|---------|
| Frontend ne može da dođe do backend-a | IP adresa / mreža | Proveri `API_URL` u api/*.js (koristi lokalnu LAN adresu) |
| 401 Unauthorized | Token istekao | Ponovna prijava |
| “Network request failed” na telefonu | Nisi na istoj Wi-Fi mreži | Poveži uređaj i PC na isti LAN |
| Komentari se ne vide | API ne vraća `tree` / greška u ruti | Testiraj GET /comments u Postman-u |
| Tamna tema ne radi | Hardkod boje u stilu | Zameniti `#...` sa `theme.colors.*` |
| Upozorenje VirtualizedLists nested | FlatList u ScrollView | Re-faktorisan u jednu FlatList sa header/footer |

---

## Autor / Kontakt

Dodaj (po želji):
- GitHub profil: https://github.com/dragancoli
- Email: colicd85@gmail.com

---
