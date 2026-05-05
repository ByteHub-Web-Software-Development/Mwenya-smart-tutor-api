# SmartTutor API

The backend API for the **SmartTutorZM** mobile and web applications — built with NestJS, Prisma, and MongoDB.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| Database ORM | Prisma 6 + MongoDB |
| Authentication | JWT (via `@nestjs/jwt`) |
| Validation | `class-validator` + `class-transformer` |
| Documentation | Scalar API Reference (`@scalar/nestjs-api-reference`) |
| AI Chat | DeepSeek API (via `axios`) |
| Rate Limiting | `@nestjs/throttler` |

---

## 🔧 Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- Access to a MongoDB Atlas cluster (or local MongoDB)

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `5180`) |
| `DATABASE_URL` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret for signing JWT tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `THROTTLE_TTL` | No | Rate limit window in ms (default: `60000`) |
| `THROTTLE_LIMIT` | No | Max requests per window (default: `20`) |
| `OPENAI_KEY` | **Yes** | DeepSeek API key for the AI chatbot |

---

## 🏃 Running Locally

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start in development mode (watch)
npm run start:dev
```

The API will be available at:

- **API Reference (Scalar):** http://localhost:5180/reference
- **OpenAPI JSON:** http://localhost:5180/api-json-json

---

## 🚀 Deployment (PM2)

The recommended production deployment is using **PM2** with the provided `ecosystem.config.js`.

### First-time Setup
```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Generate Prisma client
npx prisma generate

# 4. Start with PM2
pm2 start ecosystem.config.js
```

### Management Commands
```bash
pm2 status          # Check status
pm2 logs            # View logs
pm2 reload all      # Zero-downtime restart
pm2 stop all        # Stop the API
```

---

## 🔐 Authentication

All endpoints are **JWT-protected** by default. To access them:

1. Call `POST /auth/login` or `POST /auth/dashboard/login` with your `msisdn`, `pin`, and `device_id`.
2. Copy the `jwtToken` from the response.
3. Include it as a Bearer token in all subsequent requests:
   ```
   Authorization: Bearer <token>
   ```

### Role IDs

| ID | Role |
|---|---|
| `1` | Student |
| `2` | Teacher |
| `3` | Sales Manager |
| `4` | Admin |

Roles are embedded in the JWT payload and enforced by the global `RolesGuard`.

---

## 🧪 Running Tests

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

---

## 📦 API Modules

| Module | Base Path | Description |
|---|---|---|
| Auth | `/auth` | Login, logout, authentication, account deletion |
| Exams | `/exams` | Exam papers and content management |
| Lessons | `/lessons` | Lesson and lesson content management |
| Subjects | `/subjects` | Subject catalogue |
| Subject Topics | `/subject-topic` | Topics under subjects |
| Subscription | `/subscription` | Subscription plans and user subscriptions |
| Payment | `/payment` | Payment initiation and receipts |
| Stats | `/stats` | Analytics — admin, sales manager, teacher views |
| Chat | `/chat` | AI tutoring chatbot (DeepSeek) |

---

## 🏗️ Project Structure

```
src/
├── auth/               # Authentication module
├── chat/               # AI chat module
├── common/
│   ├── decorators/     # @Public(), @Roles()
│   ├── dto/            # Shared response DTOs
│   ├── filters/        # Global HTTP exception filter
│   ├── guards/         # JwtAuthGuard, RolesGuard
│   └── interceptors/   # Global response interceptor
├── exams/              # Exams module
├── lessons/            # Lessons module
├── payment/            # Payment module
├── prisma/             # PrismaService + PrismaModule
├── stats/              # Stats/analytics module
├── subject-topic/      # Subject topics module
├── subjects/           # Subjects module
├── subscription/       # Subscription module
└── types/              # Legacy type interfaces (being migrated to DTOs)
```

---

## 📝 API Versioning

The current version is **v2.0.0**. Future breaking changes will be introduced under a versioned prefix (e.g., `/v2/`).
