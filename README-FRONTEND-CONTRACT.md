# Frontend-Backend Contract Documentation

Dokumentasi ini merangkum seluruh skema database, API endpoints, validasi request, dan format balasan dari server. Hal ini bertujuan sebagai panduan utama (contract) bagi Frontend Developer untuk melakukan data fetching dan integrasi API.

---

## 1. Database Schema (Prisma Models)

Berikut adalah struktur model di database yang akan sering direferensikan dalam response balasan API. Perhatikan *case-sensitivity* dari setiap nama atribut.

### 🛡️ Auth & User
- **`User`**
  - `id` (Int)
  - `email` (String)
  - `password` (String)
  - `name` (String)
  - `phone` (String, opsional)
  - `avatarUrl` (String, opsional)
  - `role` (Role: `USER` | `ADMIN`)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)
  - `isTwoFactorEnabled` (Boolean)

- **`OtpCode`**
  - `id` (Int)
  - `email` (String)
  - `code` (String)
  - `expiresAt` (DateTime)
  - `used` (Boolean)
  - `attempts` (Int)
  - `createdAt` (DateTime)

### 🎓 Student Profile
- **`Major`**: `id` (Int), `name` (String)
- **`Batch`**: `id` (Int), `year` (String)
- **`Student`**: `id` (Int), `nis` (String), `name` (String), `majorId` (Int), `batchId` (Int)

### 📦 Catalog & Project
- **`Category`**: `id` (Int), `name` (String), `slug` (String)
- **`Project`**
  - `id` (Int)
  - `title` (String)
  - `slug` (String)
  - `description` (String)
  - `price` (Decimal)
  - `thumbnail` (String, opsional)
  - `mediaUrls` (Json array foto)
  - `status` (ProjectStatus: `DRAFT` | `PUBLISHED` | `ARCHIVED`)
  - `averageRating` (Decimal)
  - `totalReviews` (Int)
  - `wishlistCount` (Int)
  - `categoryId` (Int)
  - `createdAt` / `updatedAt` (DateTime)
- **`Tag`**: `id` (Int), `name` (String)

### 🛒 Cart & Transaction
- **`Cart`**: `id` (Int), `userId` (Int), `createdAt`, `updatedAt`
- **`CartItem`**: `id` (Int), `cartId` (Int), `projectId` (Int), `quantity` (Int)
- **`BankAccount`**: `id` (Int), `bankName` (String), `accountNumber` (String), `accountOwner` (String), `isActive` (Boolean)
- **`Order`**
  - `id` (Int)
  - `orderCode` (String)
  - `userId` (Int)
  - `totalPrice` (Decimal)
  - `status` (OrderStatus: `PENDING`, `PENDING_PAYMENT`, `WAITING_VERIFICATION`, `PAID`, `REJECTED`, `CANCELLED`)
  - `message` (String, opsional)
  - `bankAccountId` (Int, opsional)
  - `createdAt` / `updatedAt` (DateTime)
- **`OrderItem`**: `id` (Int), `orderId` (Int), `projectId` (Int, opsional), `projectName` (String), `price` (Decimal), `thumbnail` (String, opsional), `quantity` (Int)
- **`PaymentProof`**: `id` (Int), `orderId` (Int), `fileUrl` (String), `status` (PaymentProofStatus: `PENDING`, `APPROVED`, `REJECTED`), `adminNote` (String, opsional)

### 💬 Interaction & Support
- **`Contact`**: `id` (Int), `name` (String), `email` (String), `phone` (String, opsional), `message` (String), `status` (ContactStatus: `UNREAD`, `READ`, `REPLIED`)
- **`Rating`**: `id` (Int), `userId` (Int), `projectId` (Int), `score` (Int), `comment` (String, opsional)
- **`Wishlist`**: `id` (Int), `userId` (Int), `projectId` (Int)

---

## 2. API Endpoints & Role Access

Daftar endpoint dengan metode HTTP, route path, dan guard auth yang dibutuhkan.
- **Publik**: Dapat diakses tanpa token.
- **User**: Membutuhkan JWT (login sebagai user).
- **Admin**: Membutuhkan JWT (login sebagai admin).

| Resource | Method | URL Path | Akses |
|---|---|---|---|
| **Auth** | POST | `/auth/register` | Publik |
| | POST | `/auth/login` | Publik |
| | POST | `/auth/verify-otp` | Publik |
| **Users** | GET | `/users/me` | User |
| | PATCH | `/users/me` | User |
| | PATCH | `/users/toggle-2fa` | User / Admin |
| | GET, POST | `/users` | Publik (POST) / Admin (GET) |
| | GET, PATCH, DELETE | `/users/:id` | Admin |
| **Bank Account** | GET | `/bank-accounts/active` | User |
| | GET, POST | `/bank-accounts` | Admin |
| | GET, PATCH, DELETE | `/bank-accounts/:id` | Admin (PATCH, DELETE) / User (GET) |
| **Batches** | GET, POST | `/batches` | Admin |
| | GET, PATCH, DELETE | `/batches/:id` | Admin |
| **Majors** | GET, POST | `/majors` | Admin |
| | GET, PATCH, DELETE | `/majors/:id` | Admin |
| **Students** | GET, POST | `/students` | Admin |
| | GET, PATCH, DELETE | `/students/:id` | Admin |
| **Carts** | GET, POST, DELETE | `/carts` | User |
| | POST | `/carts/items` | User |
| | DELETE | `/carts/items/:projectId` | User |
| **Categories** | GET | `/categories` | Publik |
| | GET | `/categories/:id` | Publik |
| | POST | `/categories` | Admin |
| | PATCH, DELETE | `/categories/:id` | Admin |
| **Projects** | GET | `/projects` | Publik |
| | GET | `/projects/published` | Publik |
| | GET | `/projects/:slugOrId` | Publik (kecuali DRAFT -> Admin) |
| | GET | `/projects/all/admin` | Admin |
| | POST | `/projects` | Admin (Multipart FormData) |
| | PATCH, DELETE | `/projects/:id` | Admin |
| **Tags** | GET, POST | `/tags` | Publik (berdasarkan config) |
| | GET, PATCH, DELETE | `/tags/:id` | Publik (berdasarkan config) |
| **Orders** | POST | `/orders` & `/orders/checkout` | User |
| | GET | `/orders` | User |
| | GET | `/orders/:id` | User |
| | PATCH, DELETE | `/orders/:id` | Admin |
| **Payment** | GET | `/payment/proof/:orderId` | User |
| | GET | `/payment/bill/:orderId` | User |
| | POST | `/payment/upload-proof/:orderId` | User (Multipart FormData) |
| | PATCH | `/payment/verify/:id` | Admin |
| **Ratings** | GET | `/ratings/project/:projectId` | Publik |
| | POST | `/ratings` | User |
| **Wishlists** | GET | `/wishlists` | User |
| | POST | `/wishlists/:projectId` | User |
| | GET | `/wishlists/check/:projectId` | User |
| **Contacts** | POST | `/contacts` | Publik |
| | GET | `/contacts` | Admin |
| | GET, PATCH, DELETE | `/contacts/:id` | Admin |

---

## 3. Request Payloads (DTOs)

Berikut merupakan field JSON Body (DTO) yang dibutuhkan ketika mengirimkan *request* ke server. Untuk `PATCH` / `PUT`, format umumnya menggunakan DTO Create di bawah, namun bersifat **Opsional**.

### 🔐 Auth
```json
// POST /auth/register
{
  "name": "string (Required)",
  "email": "string (Required, valid email)",
  "password": "string (Required, min. 6 karakter)",
  "phone": "string (Opsional)"
}

// POST /auth/login
{
  "email": "string (Required)",
  "password": "string (Required)"
}

// POST /auth/verify-otp
{
  "email": "string (Required)",
  "code": "string (Required, 6 karakter)"
}
```

### 👤 Users
```json
// POST /users
{
  "name": "string (Required)",
  "email": "string (Required)",
  "password": "string (Required)",
  "role": "USER | ADMIN (Opsional, default: USER)"
}

// PATCH /users/toggle-2fa
{
  "enable": "boolean (Required)",
  "userId": "number (Opsional)"
}
```

### 🏦 Bank Account
```json
// POST /bank-accounts
{
  "bankName": "string (Required)",
  "accountNumber": "string (Required)",
  "accountOwner": "string (Required)"
}
// PATCH /bank-accounts/:id menyertakan field di atas (opsional) ditambah:
// "isActive": boolean (Opsional)
```

### 🎓 Akademik (Batches, Majors, Students)
```json
// POST /batches
{
  "year": "string (Required)"
}

// POST /majors
{
  "name": "string (Required)"
}

// POST /students
{
  "nis": "string (Required)",
  "name": "string (Required)",
  "majorId": "number (Required)",
  "batchId": "number (Required)"
}
```

### 📦 Categories & Tags
```json
// POST /categories
{
  "name": "string (Required)",
  "slug": "string (Required)"
}

// POST /tags
{
  "name": "string (Required)"
}
```

### 🛒 Cart & Orders
```json
// POST /carts/items
{
  "projectId": "number (Required)",
  "quantity": "number (Opsional)"
}

// POST /orders (atau /orders/checkout)
{
  "orderCode": "string (Required)",
  "userId": "number (Required)",
  "totalPrice": "number (Required)",
  "message": "string (Opsional)",
  "bankAccountId": "number (Opsional)"
}
// Catatan: controller checkout juga menerima body payload khusus transaksi tergantung service internal
```

### 💳 Payment & Upload
Untuk endpoint `/payment/upload-proof/:orderId` dan `/projects` digunakan `multipart/form-data` dengan field:
- `file` (Upload Proof)
- `thumbnail`, `mediaUrls` (Project - khusus Admin)

```json
// PATCH /payment/verify/:id
{
  "status": "PENDING | APPROVED | REJECTED (Required)",
  "adminNote": "string (Opsional)"
}
```

### 💬 Support & Interaction
```json
// POST /contacts
{
  "name": "string (Required)",
  "email": "string (Required)",
  "phone": "string (Opsional)",
  "message": "string (Required)"
}
// PATCH /contacts/:id -> bisa mengirim `status`: "UNREAD" | "READ" | "REPLIED"

// POST /ratings
{
  "userId": "number (Required)",
  "projectId": "number (Required)",
  "score": "number (Required)",
  "comment": "string (Opsional)"
}
```

---

## 4. Response Format

Mayoritas endpoint di backend ini dibungkus menggunakan standard *Response Wrapper* agar Frontend mudah mem-parsing balasan.

### Standard Format
```json
{
  "success": true,
  "message": "Pesan deskriptif dari server",
  "data": { ... } // Berisi object atau array sesuai resource 
}
```

### Format Khusus (Khusus Modul Projects)
Modul **Projects** (`/projects`) memiliki format Wrapper sedikit berbeda dan mencantumkan kode HTTP (meskipun kode asli HTTP response juga dikirimkan).
```json
{
  "code": 200,
  "status": "success", 
  "message": "Data berhasil diambil",
  "data": { ... }
}
```

### Format Error (Standard)
Jika request bermasalah (Validation error, Not Found, Internal Error dll), NestJS akan mengembalikan balasan dengan *HTTP status code* yang sesuai (misal: 400, 404, 500) dan *response body* sebagai berikut:
```json
{
  "success": false,
  "message": "Alasan error spesifik"
}
```
*Untuk validasi DTO dengan Exception Format khusus (misal dari Auth), error message bisa berbentuk array pesan validasi yang tidak dipenuhi.*
