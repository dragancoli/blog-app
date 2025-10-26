# BlogApp (React Native + Node/Express + PostgreSQL)

A full-stack mobile and web blogging application where users can register, log in, create, edit, and delete posts, view details, and comment (including replies) — all secured with JWT authentication and supporting both dark and light themes.

---

## Table of Contents

* [Features](#features)
* [Technologies](#technologies)
* [Project Structure](#project-structure)
* [Installation & Setup](#installation--setup)

  * [1. Cloning](#1-cloning)
  * [2. Backend Setup](#2-backend-setup)
  * [3. Database](#3-database)
  * [4. .env Configuration (Backend)](#4-env-configuration-backend)
  * [5. Running the Backend](#5-running-the-backend)
  * [6. Frontend (React Native / Expo)](#6-frontend-react-native--expo)
* [API Overview](#api-overview)

  * [Authentication](#authentication)
  * [Posts](#posts)
  * [Comments](#comments)
  * [Users](#users)
* [JWT Details](#jwt-details)
* [Themes (Light / Dark)](#themes-light--dark)
* [Validation & Security](#validation--security)
* [Potential Improvements](#potential-improvements)
* [Troubleshooting](#troubleshooting)

---

## Features

### Backend

* Registration / Login (JWT, bcrypt password hashing)
* CRUD operations for posts (authorization for edit/delete)
* Comment system with reply support (`parent_id`)
* Automatic timestamps (`created_at`, `updated_at` via triggers)
* Ownership validation for resources
* Modular Express routes

### Frontend (React Native + react-native-paper)

* Login / Registration screens
* Post list view
* Create, edit, and delete user-owned posts
* Post detail view
* Comment section (add, reply, edit, delete)
* Dynamic light/dark theme based on system preferences
* Post search functionality
* Profile editing

---

## Technologies

| Layer    | Technologies                                          |
| -------- | ----------------------------------------------------- |
| Backend  | Node.js, Express.js, PostgreSQL, bcrypt, jsonwebtoken |
| Frontend | React Native, react-native-paper, AsyncStorage        |
| Auth     | JWT (HTTP header: `x-auth-token`)                     |
| Styling  | React Native StyleSheet + Paper theming               |
| Other    | Axios (HTTP), jwt-decode                              |

---

## Project Structure

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
        userController.js
      middleware/
        authMiddleware.js
      routes/
        authRoutes.js
        postRoutes.js
        commentRoutes.js
        userRoutes.js
      index.js
    package.json
    .env (local – do not commit)
  app/
    api/
      auth.js
      posts.js
      comments.js
      users.js
    screens/
      LoginScreen.js
      RegisterScreen.js
      HomeScreen.js
      CreatePostScreen.js
      EditPostScreen.js
      PostDetailScreen.js
      ProfileScreen.js
    components/
      CommentsSection.js
      ProfileHeader.js
      EmptyState.js
      ErrorState.js
      PostCard.js
    context/
      AuthContext.js
    navigation/
      AppNavigator.js
    theme.js
    App.js
    package.json
    index.js
  .gitignore
```

---

## Installation & Setup

### 1. Cloning

```bash
git clone https://github.com/dragancoli/blog-app.git
cd blog-app
```

### 2. Backend Setup

```bash
cd server
npm install
```

### 3. Database

Create a PostgreSQL database (e.g., `blog-app`). Configure database details in the `.env` file.
Make sure to execute SQL scripts that create necessary tables, triggers, and procedures.

### 4. .env Configuration (Backend)

Create `server/.env`:

```
DB_USER=your_postgres_user
DB_HOST=localhost
DB_DATABASE=blog_db
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
```

Your `db.js` should reference these variables (e.g., via `pg` Pool).

### 5. Running the Backend

```bash
npm run dev     # if using nodemon
# or
node src/index.js
```

Server will run on: `http://localhost:3000`

### 6. Frontend (React Native / Expo)

Open a second terminal:

```bash
cd ../app
npm install
```

Ensure the API base URL in `api/*.js` matches your local network IP (e.g., `http://192.168.x.x:3000`).
For testing on a real device (Expo Go), use your machine’s LAN IP, not `127.0.0.1`.

Run Expo:

```bash
npm start
# or
npx expo start
```

---

## API Overview

### Authentication

| Method | Route              | Description | Body                                |
| ------ | ------------------ | ----------- | ----------------------------------- |
| POST   | /api/auth/register | Register    | `{ "username","email","password" }` |
| POST   | /api/auth/login    | Login       | `{ "email","password" }`            |

Response:

```json
{ "token": "JWT_TOKEN_STRING" }
```

Header for protected routes:

```
x-auth-token: <JWT>
```

### Posts

| Method | Route          | Auth   | Description      |
| ------ | -------------- | ------ | ---------------- |
| GET    | /api/posts     | No     | Get all posts    |
| GET    | /api/posts/:id | No     | Get post details |
| POST   | /api/posts     | Yes    | Create post      |
| PUT    | /api/posts/:id | Author | Edit post        |
| DELETE | /api/posts/:id | Author | Delete post      |

Example:

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "x-auth-token: TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"First post","content":"This is the content."}'
```

### Comments

| Method | Route                                 | Auth   | Description                 |
| ------ | ------------------------------------- | ------ | --------------------------- |
| GET    | /api/posts/:postId/comments?mode=tree | No     | Get comments (flat or tree) |
| POST   | /api/posts/:postId/comments           | Yes    | New comment / reply         |
| PUT    | /api/comments/:id                     | Author | Edit comment                |
| DELETE | /api/comments/:id                     | Author | Delete comment              |

Example reply:

```bash
curl -X POST http://localhost:3000/api/posts/1/comments \
  -H "x-auth-token: TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Reply text","parent_id":5}'
```

---

### Users

| Method | Route                        | Auth | Description            |
| ------ | ---------------------------- | ---- | ---------------------- |
| GET    | /api/users/me                | Yes  | My profile             |
| PUT    | /api/users/me                | Yes  | Update profile         |
| GET    | /api/users/:id               | Yes  | Another user’s profile |
| GET    | /api/users/:userId/posts/:id | No   | Posts by user          |

---

## JWT Details

Payload example:

```json
{ "id": <user_id>, "iat": 123456789, "exp": 123456999 }
```

* Stored in AsyncStorage as `userToken`
* Sent via `x-auth-token` header
* Decoded client-side using `jwtDecode(userToken)` to verify ownership (e.g., post.author_id / comment.user_id)

---

## Themes (Light / Dark)

`react-native-paper` theme follows system settings:

* `useColorScheme()` selects light/dark
* Colors defined in `theme.js`
* Use `useTheme()` across screens (e.g., PostDetailScreen, EditPostScreen)
* Avoid hard-coded colors; instead use:

  * `theme.colors.background`
  * `theme.colors.onBackground`
  * `theme.colors.primary`
  * `theme.colors.surfaceVariant`
  * `theme.colors.outline`

---

## Validation & Security

| Layer    | Validation                                               |
| -------- | -------------------------------------------------------- |
| Backend  | Empty fields (auth, posts, comments)                     |
| Backend  | Resource ownership validation (author_id vs req.user.id) |
| Backend  | Password hashing (bcrypt)                                |
| Backend  | JWT verification (authMiddleware)                        |
| Frontend | Prevent submitting empty fields                          |
| Frontend | Fallback to 'Unknown' for missing author                 |

Additional (optional) improvements:

* Rate limiting
* Brute-force login protection
* Content sanitization (if adding rich text/markdown)
* Token revocation (refresh token mechanism)

---

## Potential Improvements

* Likes / reactions for posts and comments
* Bookmarks
* Tags + filtering
* Pagination / infinite scroll
* Notifications (e.g., new comments)
* Markdown / image uploads
* Admin panel
* i18n (EN/SR)
* Offline cache & optimistic UI
* Tests (Jest / Detox)

---

## Troubleshooting

| Problem                            | Cause                       | Solution                                       |
| ---------------------------------- | --------------------------- | ---------------------------------------------- |
| Frontend can’t reach backend       | IP mismatch / network issue | Check `API_URL` in api/*.js and use LAN IP     |
| 401 Unauthorized                   | Token expired               | Log in again                                   |
| “Network request failed” on device | Not on same Wi-Fi           | Connect phone & PC to same network             |
| Comments not visible               | API error                   | Test GET /comments in Postman                  |
| Dark theme not working             | Hardcoded colors            | Replace with `theme.colors.*`                  |
| VirtualizedLists warning           | Nested FlatLists            | Refactor to single FlatList with header/footer |

---

## Author / Contact

* GitHub: [dragancoli](https://github.com/dragancoli)
* Email: [colicd85@gmail.com](mailto:colicd85@gmail.com)

---
