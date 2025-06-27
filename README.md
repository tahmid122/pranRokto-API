# 🩸 Pran Rokto – Backend (API Server)

This is the **backend** API server for the [Pran Rokto](https://pran-rokto.vercel.app) blood donor finder web application. It handles authentication, donor data, search operations, reviews, image uploads, and more.

Built with **Node.js**, **Express.js**, and **MongoDB**, this backend provides a RESTful API with secure JWT-based authentication and integrates Cloudinary for image storage.

---

## 🩸 Client

🔗[**Client Repository**](https://github.com/tahmid122/Pran-Rokto)

## ⚙️ Technologies Used

| Package/Tool            | Version          | Purpose                            |
| ----------------------- | ---------------- | ---------------------------------- |
| Node.js                 | ≥18.x            | Runtime                            |
| Express.js              | ^4.21.0          | Server framework                   |
| MongoDB (native)        | ^6.9.0           | Database                           |
| Mongoose                | ^8.6.3           | ODM for MongoDB                    |
| Bcrypt.js               | ^2.4.3           | Password hashing                   |
| JSON Web Token (JWT)    | ^9.0.2           | Authentication                     |
| Passport & Passport-JWT | ^0.7.0 / ^4.0.1  | Auth strategies                    |
| Multer + Cloudinary     | ^1.4.5 / ^1.41.3 | Image upload & hosting             |
| Multer-Cloudinary       | ^4.0.0           | Cloudinary adapter for Multer      |
| Dotenv                  | ^16.4.5          | Environment variable management    |
| CORS                    | ^2.8.5           | Cross-origin resource sharing      |
| Body-parser             | ^1.20.3          | Parsing incoming requests          |
| Nodemon                 | ^3.1.7           | Auto-restarting during development |

---

---

## 🚀 Getting Started

### 1. Clone the project (if not already)

```bash
git clone https://github.com/tahmid122/pranRokto-API.git
cd pranRokto-API
npm install
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create .env file

Create a .env file in the apipranrokto directory and add the following:

```bash
PORT=5000
MONGO_URL=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Start the development server

```bash
npm start
```

## 🔐 Authentication

- JWT authentication using passport-jwt
- Separate strategies for:
- Donors
- Admins
- Passwords are securely hashed with bcrypt

## 📡 API Endpoints (Selected)

| Method | Endpoint                      | Description                 |
| ------ | ----------------------------- | --------------------------- |
| POST   | `/donorsData`                 | Register donor              |
| POST   | `/login`                      | Donor login                 |
| POST   | `/admin-login`                | Admin login                 |
| GET    | `/donor/:number`              | Get donor by number         |
| POST   | `/donor/update/photo/:number` | Upload profile photo        |
| POST   | `/main-review`                | Submit a public review      |
| POST   | `/getSearchResult`            | Search donors by criteria   |
| POST   | `/change-password/:number`    | Change password             |
| GET    | `/profile`                    | Authenticated profile route |
| GET    | `/all-donors`                 | Get all donor data          |

## 🧪 Tools & Postman

For testing routes:

- Use Postman
- Pass Authorization: Bearer <token> in headers for protected routes

## 📝Author

- Name: **Tahmid Alam**
- GitHub: [@tahmid122](www.github.com/tahmid122)
- Email: <mdtahmidalam122@gmail.com>
