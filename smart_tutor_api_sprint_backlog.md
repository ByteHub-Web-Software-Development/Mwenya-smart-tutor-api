# SmartTutor API — 2-Week Modernisation Sprint Backlog
> **Sprint Dates:** Week 1: Apr 17 – Apr 23 · Week 2: Apr 24 – Apr 30, 2026  
> **Project:** `smart-tutor-api` (NestJS + Prisma + MongoDB)  
> **Goal:** Fully modernise the API — wire all stubs, standardise patterns, add JWT guard protection, complete Scalar documentation, and ship a production-quality build.

---

## 📋 How to Import to ClickUp

Copy each **Epic** as a **List**, each **Story/Task** as a **Task**, and each sub-bullet as a **Subtask**. Tags are suggested for each task.

---

## 🗂️ EPIC 1 — Project Foundation & Infrastructure

> **Tags:** `infrastructure` `setup` `devops`

---

### STORY 1.1 — Fix `AppModule` Import Path Bug *(Day 1 — P0)*
**Points:** 2

`SubjectTopicService` is imported from a non-existent path (`./nest/subject-topic/subject-topic.service`). This crashes the app at startup.

- [ ] Fix import path for `SubjectTopicService` in `app.module.ts` to `./subject-topic/subject-topic.service`
- [ ] Verify the app bootstraps without errors (`npm run start:dev`)
- [ ] Add `SubjectTopicModule` as a proper NestJS module with its own `module.ts`

---

### STORY 1.2 — Environment & Config Module Setup *(Day 1)*
**Points:** 3

- [ ] Install and configure `@nestjs/config` with a `.env` schema
- [ ] Define typed env vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `THROTTLE_TTL`, `THROTTLE_LIMIT`
- [ ] Create a `config/` folder with `app.config.ts` and `jwt.config.ts`
- [ ] Update `AppModule` to use `ConfigModule.forRoot({ isGlobal: true })`
- [ ] Replace all hardcoded `process.env.PORT ?? 5180` references with config service

---

### STORY 1.3 — Global JWT Auth Guard *(Day 1–2)*
**Points:** 5

Currently **no endpoints are protected** — the JWT package is installed but guards are never applied.

- [ ] Create `src/auth/guards/jwt-auth.guard.ts` using `@nestjs/jwt` + `PassportStrategy`
- [ ] Install `@nestjs/passport` and `passport-jwt`
- [ ] Create `JwtStrategy` that validates payload and attaches user to request
- [ ] Create a `@Public()` decorator for endpoints that should bypass auth
- [ ] Register guard globally in `AppModule` via `APP_GUARD`
- [ ] Mark the following as `@Public()`:
  - `POST /auth/login`
  - `POST /auth/dashboard/login`
  - `POST /auth/delete-request`
  - `GET /auth/delete/account/:username`
  - `GET /auth/delete-request/:username`

---

### STORY 1.4 — Standardise Global Error Handling *(Day 2)*
**Points:** 3

- [ ] Create a `src/common/filters/http-exception.filter.ts` global exception filter
- [ ] Ensure all error responses conform to `{ statusCode, message, error, timestamp, path }`
- [ ] Register filter globally in `main.ts`
- [ ] Remove the inline `HttpException` catch-and-rethrow boilerplate from all 9 controllers (controllers should be thin — services throw, filters catch)

---

### STORY 1.5 — Global Response Interceptor *(Day 2)*
**Points:** 2

- [ ] Create `src/common/interceptors/response.interceptor.ts`
- [ ] Wrap all successful `2xx` responses in `{ statusCode, message, data, timestamp }`
- [ ] Register interceptor globally in `main.ts`

---

### STORY 1.6 — NestJS Module Refactor for all Stub Modules *(Day 2–3)*
**Points:** 3

The `payment`, `subjects`, `subscription`, and `subject-topic` modules are empty stubs with no `.module.ts` file for some.

- [ ] Create `payment.module.ts` and register `PaymentController` + `PaymentService`
- [ ] Create `subjects.module.ts` and register `SubjectsController` + `SubjectsService`
- [ ] Create `subscription.module.ts` and register `SubscriptionController` + `SubscriptionService`
- [ ] Create `subject-topic.module.ts` and register `SubjectTopicController` + `SubjectTopicService`
- [ ] Update `AppModule` to use `imports: [...]` for all feature modules (remove direct controller/service imports from `AppModule`)

---

## 🗂️ EPIC 2 — Auth Module (`/auth`)

> **Tags:** `auth` `backend` `security`

---

### STORY 2.1 — Auth DTOs & Validation *(Day 2)*
**Points:** 3

- [ ] Create `src/auth/dto/login.dto.ts` with `class-validator` decorators (`@IsString`, `@IsNotEmpty`, `@IsMobilePhone` for msisdn)
- [ ] Create `src/auth/dto/dashboard-login.dto.ts`
- [ ] Create `src/auth/dto/delete-request.dto.ts`
- [ ] Replace raw inline body types in `auth.controller.ts` with proper DTOs
- [ ] Ensure `ValidationPipe` is applied (already global in `main.ts` ✅)

---

### STORY 2.2 — Auth Endpoints — Implementation Review & Hardening *(Day 3)*
**Points:** 5

- [ ] `POST /auth/login` — Validate that a session record is created/updated on successful login
- [ ] `POST /auth/logout` — Confirm sessions are deleted; return 404 if user has no session
- [ ] `POST /auth/devicelogout` — Should only delete the session matching the specific `device_id` (currently deletes all sessions — this is a bug)
- [ ] `GET /auth/authenticated` — Migrate from header-based params to `@Headers()` with proper guard; validate both `user_name` and `device_id` are present
- [ ] `POST /auth/dashboard/login` — Role guard: Only allow `user_role` values `1`, `2`, `3`, `4`; return `403` for plain student accounts
- [ ] `POST /auth/delete-request` — Implement actual soft-delete flag on `User_Details` or store to a deletion queue table
- [ ] `GET /auth/delete/account/:username` — Cascade-delete OTPs, Sessions, and Receipts before deleting user; wrap in a Prisma transaction
- [ ] `GET /auth/delete-request/:username` — Rename endpoint method to return actual delete request status, not a generic message

---

### STORY 2.3 — Auth Scalar Documentation *(Day 3)*
**Points:** 3

- [ ] Add `@ApiTags('Auth')` to `AuthController`
- [ ] Add `@ApiOperation({ summary })` and `@ApiResponse` to all 8 auth endpoints
- [ ] Add `@ApiBody({ type: LoginDto })` to POST endpoints
- [ ] Add `@ApiParam` to parameterised GET endpoints
- [ ] Add `@ApiBearerAuth()` to guarded endpoints

---

## 🗂️ EPIC 3 — Exams Module (`/exams`)

> **Tags:** `exams` `backend` `content`

---

### STORY 3.1 — Exams DTOs & Validation *(Day 3)*
**Points:** 3

- [ ] Create `src/exams/dto/add-exam.dto.ts` — migrate from `types/exam-types.ts` to class-based DTOs with `class-validator`
- [ ] Create `src/exams/dto/add-exam-content.dto.ts`
- [ ] Create `src/exams/dto/update-exam.dto.ts`
- [ ] Create `src/exams/dto/update-full-exam.dto.ts`
- [ ] Replace `import type {...}` references in controller with new DTOs

---

### STORY 3.2 — Exams Endpoints — Hardening *(Day 4)*
**Points:** 5

- [ ] `POST /exams/addExamPaper` — Replace `Date.now().toString()` ID with a proper `nanoid` or `cuid2` generator; validate `subject_id` exists before inserting
- [ ] `GET /exams/getExam/:id` — Return proper `404` via `NotFoundException` (already done ✅) — add `include: { exam_content: true }` to return related content
- [ ] `GET /exams/getAllExam` — Add pagination: `?page=1&limit=20`
- [ ] `POST /exams/addExamContent` — Validate `examId` references an existing `Exam` before insert
- [ ] `GET /exams/getExamContent/:id` — Return **all** content for an exam, not just `findFirst`
- [ ] `GET /exams/getAllExamContent` — Add pagination
- [ ] `GET /exams/getExamBySubject/:id` — Validate subject exists; include exam_content
- [ ] `GET /exams/delete/examByID/:id` — **Rename to `DELETE /exams/:id`** (using GET for deletion is an anti-pattern); cascade delete `exam_content` first
- [ ] `PUT /exams/update/examByID` — Use `PATCH /exams/:id` instead; avoid dynamic column name injection (SQL injection risk)
- [ ] `PUT /exams/updateAll/examByID` — Use `PUT /exams/:id`

---

### STORY 3.3 — Exams Scalar Documentation *(Day 4)*
**Points:** 3

- [ ] Add `@ApiTags('Exams')` to `ExamsController`
- [ ] Decorate all 10 endpoints with `@ApiOperation`, `@ApiResponse` (200, 400, 404, 500)
- [ ] Add `@ApiBody` to all POST/PUT endpoints
- [ ] Add `@ApiParam` to all `:id` endpoints
- [ ] Add `@ApiQuery` for pagination parameters

---

## 🗂️ EPIC 4 — Lessons Module (`/lessons`)

> **Tags:** `lessons` `backend` `content`

---

### STORY 4.1 — Lessons DTOs & Validation *(Day 4)*
**Points:** 3

- [ ] Create `src/lessons/dto/add-lesson.dto.ts`
- [ ] Create `src/lessons/dto/update-lesson.dto.ts`
- [ ] Create `src/lessons/dto/update-full-lesson.dto.ts`
- [ ] Replace `import type` references in controller with class DTOs

---

### STORY 4.2 — Lessons Endpoints — Hardening *(Day 5)*
**Points:** 5

- [ ] `GET /lessons` — Add pagination `?page=1&limit=20`; include `lesson_content`
- [ ] `POST /lessons/AddLesson` — Rename to `POST /lessons` (RESTful); generate proper ID (not `Date.now()`); validate `subject_id` exists
- [ ] `GET /lessons/getLessonBySubject/:id` — Validate subject exists; include `lesson_content`
- [ ] `GET /lessons/delete/lessonByID/:id` — **Rename to `DELETE /lessons/:id`**; cascade delete `lesson_content` in a transaction
- [ ] `PUT /lessons/update/lessonByID` — Use `PATCH /lessons/:id`; fix dynamic column injection
- [ ] `PUT /lessons/updateAll/lessonByID` — Use `PUT /lessons/:id`

---

### STORY 4.3 — Lessons Scalar Documentation *(Day 5)*
**Points:** 3

- [ ] Add `@ApiTags('Lessons')` to `LessonsController`
- [ ] Decorate all 6 endpoints with `@ApiOperation`, `@ApiResponse`
- [ ] Add `@ApiBody`, `@ApiParam`, `@ApiQuery` decorators as applicable

---

## 🗂️ EPIC 5 — Subjects Module (`/subjects`) & Subject Topics (`/subject-topic`)

> **Tags:** `subjects` `backend` `content`

---

### STORY 5.1 — Subjects Service & Controller Implementation *(Day 5–6)*
**Points:** 8

Currently `SubjectsController` and `SubjectsService` are empty stubs.

- [ ] Implement `SubjectsService`:
  - `getAllSubjects()` — `findMany()` with `include: { subject_topics: true }`
  - `getSubjectById(id)` — `findUnique` + 404 guard
  - `createSubject(dto)` — `create` with proper ID generation
  - `updateSubject(id, dto)` — `update`
  - `deleteSubject(id)` — `delete` with cascade guard (check for active exams/lessons)
- [ ] Implement `SubjectsController`:
  - `GET /subjects` — list all subjects
  - `GET /subjects/:id` — get single subject
  - `POST /subjects` — create subject
  - `PUT /subjects/:id` — full update
  - `PATCH /subjects/:id` — partial update
  - `DELETE /subjects/:id` — delete subject
- [ ] Create `src/subjects/dto/create-subject.dto.ts` and `update-subject.dto.ts`

---

### STORY 5.2 — Subject Topics Service & Controller Implementation *(Day 6)*
**Points:** 5

Currently `SubjectTopicController` is an empty stub.

- [ ] Implement `SubjectTopicService`:
  - `getTopicsBySubject(subjectId)` — `findMany` where `subject = subjectId`
  - `createTopic(dto)` — `create`
  - `deleteTopic(id)` — `delete`
  - `updateTopic(id, dto)` — `update`
- [ ] Implement `SubjectTopicController`:
  - `GET /subject-topic/:subjectId` — get topics by subject
  - `POST /subject-topic` — create topic
  - `PATCH /subject-topic/:id` — update topic
  - `DELETE /subject-topic/:id` — delete topic
- [ ] Create `src/subject-topic/dto/create-topic.dto.ts`

---

### STORY 5.3 — Subjects & Topics Scalar Documentation *(Day 6)*
**Points:** 3

- [ ] Add `@ApiTags('Subjects')` and `@ApiTags('Subject Topics')`
- [ ] Decorate all endpoints with full Scalar/Swagger metadata
- [ ] Add `@ApiBearerAuth()` to all protected endpoints

---

## 🗂️ EPIC 6 — Subscription Module (`/subscription`)

> **Tags:** `subscription` `backend` `payments`

---

### STORY 6.1 — Subscription Service & Controller Implementation *(Day 6–7)*
**Points:** 8

Currently `SubscriptionController` and `SubscriptionService` are empty stubs.

- [ ] Implement `SubscriptionService`:
  - `getAllSubscriptionPlans()` — fetch all `Subscription_Details`
  - `getUserSubscriptions(userId)` — fetch `Subscriptions` for a user with `include: { details: true }`
  - `createSubscription(dto)` — create record; validate `user_id` and `sub_details_id` exist
  - `getActiveSubscription(userId)` — return the most recent subscription; check against `updated_at + duration`
  - `cancelSubscription(id)` — soft-delete or status update
- [ ] Implement `SubscriptionController`:
  - `GET /subscription/plans` — list all plans
  - `GET /subscription/user/:userId` — user's subscriptions
  - `GET /subscription/active/:userId` — check active subscription
  - `POST /subscription` — create subscription record
  - `DELETE /subscription/:id` — cancel subscription
- [ ] Create `src/subscription/dto/create-subscription.dto.ts`

---

### STORY 6.2 — Subscription Scalar Documentation *(Day 7)*
**Points:** 3

- [ ] Add `@ApiTags('Subscription')`
- [ ] Decorate all 5 endpoints with full Swagger metadata

---

## 🗂️ EPIC 7 — Payment Module (`/payment`)

> **Tags:** `payment` `backend` `integrations`

---

### STORY 7.1 — Payment Service & Controller Skeleton *(Day 7)*
**Points:** 5

Currently `PaymentController` and `PaymentService` are empty stubs.

- [ ] Implement `PaymentService`:
  - `initiatePayment(dto)` — stub with mobile money integration hook (MTN/Airtel Zambia)
  - `getPaymentStatus(transId)` — fetch from `Receipts` table
  - `getReceipts(userId)` — fetch all receipts for a user
  - `createReceipt(dto)` — create a `Receipt` record with `trans_id`, `amount`, `period`
- [ ] Implement `PaymentController`:
  - `POST /payment/initiate` — initiate payment
  - `GET /payment/status/:transId` — payment status
  - `GET /payment/receipts/:userId` — user receipts
  - `POST /payment/receipt` — create receipt
- [ ] Create `src/payment/dto/initiate-payment.dto.ts` and `create-receipt.dto.ts`

---

### STORY 7.2 — Payment Scalar Documentation *(Day 7)*
**Points:** 2

- [ ] Add `@ApiTags('Payment')`
- [ ] Decorate all 4 endpoints with Swagger metadata
- [ ] Note unimplemented mobile money integration in `@ApiOperation` descriptions

---

## 🗂️ EPIC 8 — Stats Module (`/stats`)

> **Tags:** `stats` `admin` `analytics`

---

### STORY 8.1 — Stats DTOs & Auth Guard Application *(Day 8)*
**Points:** 3

- [ ] Create `src/stats/dto/add-exam-content.dto.ts` (currently uses raw inline type in controller)
- [ ] Apply `@Roles('admin')` guard to all `/stats/admin/*` endpoints
- [ ] Apply `@Roles('sales_manager')` guard to all `/stats/sales-manager/*` endpoints
- [ ] Apply `@Roles('teacher')` guard to all `/stats/teachers/*` endpoints

---

### STORY 8.2 — Stats Endpoints Review & Hardening *(Day 8)*
**Points:** 5

- [ ] `GET /stats/getAppUsers` — Verify query returns active users only; add count and list
- [ ] `GET /stats/getExam/:id` — This shadows `ExamsController` — clarify purpose (stats-specific exam view?); consider renaming
- [ ] `GET /stats/getAllExam` — Same as above; de-duplicate with Exams module or add stats-specific aggregation
- [ ] `POST /stats/addExamContent` — This duplicates `POST /exams/addExamContent`; **remove** from stats and redirect callers to exams module
- [ ] `GET /stats/admin/user-data` — Confirm aggregation query; add date range filters `?from=&to=`
- [ ] `GET /stats/admin/weekly-subscriptions` — Implement as a Prisma `groupBy` on `Subscriptions.created_at`
- [ ] `GET /stats/admin/weekly-app-users` — Implement as `groupBy` on `User_Details.created_at`
- [ ] `GET /stats/admin/daily-new-user` — Implement daily groupBy for today's signups
- [ ] `GET /stats/admin/teacher-referral-subscriptions` — Validate referral code linkage logic via `User_Details.referral_code`
- [ ] `GET /stats/admin/admin-referral-subscriptions` — Same validation
- [ ] `GET /stats/admin/total-stats` — Return combined aggregate: total users, total subscriptions, active users, revenue total
- [ ] `GET /stats/sales-manager/teachers/:id` — Verify `sales_manager_id` foreign key query is correct
- [ ] `GET /stats/sales-manager/teacher-count/:id` — Return `_count` via Prisma aggregate
- [ ] `GET /stats/sales-manager/referral-count` — Missing `:id` param — requires sales manager ID
- [ ] `GET /stats/teachers/active-students/:id` — Verify referral-to-subscription linkage in query
- [ ] `GET /stats/teachers/student-subscriptions/:id` — Verify subscription aggregation by referral code

---

### STORY 8.3 — Stats Scalar Documentation *(Day 8–9)*
**Points:** 5

- [ ] Add `@ApiTags('Stats')` to `StatsController`
- [ ] Add `@ApiTags('Stats — Admin')`, `@ApiTags('Stats — Sales Manager')`, `@ApiTags('Stats — Teacher')` grouped by role section
- [ ] Decorate all **16** stats endpoints with `@ApiOperation`, `@ApiResponse`, `@ApiParam`
- [ ] Add role requirement notes to `@ApiOperation.description` for protected endpoints
- [ ] Add `@ApiBearerAuth()` to all protected endpoints

---

## 🗂️ EPIC 9 — Chat Module (`/chat`)

> **Tags:** `chat` `ai` `backend`

---

### STORY 9.1 — Chat Module Review & Hardening *(Day 9)*
**Points:** 3

- [ ] Review `ChatService.chat()` implementation — confirm AI provider integration (Gemini)
- [ ] Add rate-limit config to `ThrottlerGuard` via env vars `THROTTLE_TTL` and `THROTTLE_LIMIT`
- [ ] Validate `ChatRequest` DTO fields with `class-validator`
- [ ] Return typed `ChatResponse` with proper error states if AI provider is unavailable

---

### STORY 9.2 — Chat Scalar Documentation *(Day 9)*
**Points:** 2

- [ ] Add `@ApiTags('Chat')`
- [ ] Add `@ApiOperation`, `@ApiBody`, `@ApiResponse` to `POST /chat/chatbot`
- [ ] Document throttle limit in `@ApiOperation.description`
- [ ] Add `@ApiBearerAuth()`

---

## 🗂️ EPIC 10 — Scalar / API Documentation Setup

> **Tags:** `documentation` `scalar` `devx`

---

### STORY 10.1 — Install & Configure Scalar *(Day 9)*
**Points:** 3

The project currently uses raw Swagger UI. Replace with Scalar for a modern, beautiful API reference.

- [ ] Install `@scalar/nestjs-api-reference`
- [ ] Update `main.ts` to serve Scalar at `/reference` instead of raw Swagger at `/api`
- [ ] Configure Scalar theme — set `title: 'SmartTutor API'`, `description`, `version: '2.0.0'`
- [ ] Fix `main.ts` config: change title from `'Hr Backend Api'` to `'SmartTutor API'`
- [ ] Fix description from the placeholder text to a real description
- [ ] Add `addBearerAuth()` to builder (already present ✅)
- [ ] Keep the raw OpenAPI JSON available at `/api-json` for tooling

---

### STORY 10.2 — Global Swagger Metadata on All Modules *(Day 9–10)*
**Points:** 5

This is a QA/audit task — confirm every controller has full Scalar-compatible Swagger decorators.

- [ ] **Auth** — 8 endpoints documented ✅ (from Story 2.3)
- [ ] **Exams** — 10 endpoints documented ✅ (from Story 3.3)
- [ ] **Lessons** — 6 endpoints documented ✅ (from Story 4.3)
- [ ] **Subjects** — 6 endpoints documented ✅ (from Story 5.3)
- [ ] **Subject Topics** — 4 endpoints documented ✅ (from Story 5.3)
- [ ] **Subscription** — 5 endpoints documented ✅ (from Story 6.2)
- [ ] **Payment** — 4 endpoints documented ✅ (from Story 7.2)
- [ ] **Stats** — 16 endpoints documented ✅ (from Story 8.3)
- [ ] **Chat** — 1 endpoint documented ✅ (from Story 9.2)
- [ ] Audit: Ensure all DTOs used in `@ApiBody` and `@ApiResponse` have `@ApiProperty` decorators on every field

---

### STORY 10.3 — Scalar Response Schema Definitions *(Day 10)*
**Points:** 5

- [ ] Create `src/common/dto/api-response.dto.ts` — shared `ApiResponseDto<T>` generic wrapper
- [ ] Create `src/common/dto/paginated-response.dto.ts` — `PaginatedResponseDto<T>` with `page`, `limit`, `total`, `data`
- [ ] Add `@ApiProperty` to all existing domain DTOs:
  - `LoginDto`, `DashboardLoginDto`
  - `AddExamDto`, `AddExamContentDto`, `UpdateExamDto`, `UpdateFullExamDto`
  - `AddLessonDto`, `UpdateLessonDto`, `UpdateFullLessonDto`
  - `CreateSubjectDto`, `UpdateSubjectDto`
  - `CreateTopicDto`
  - `CreateSubscriptionDto`
  - `InitiatePaymentDto`, `CreateReceiptDto`
  - `ChatRequest`, `ChatResponse`

---

### STORY 10.4 — Scalar Tag Groupings & Descriptions *(Day 10)*
**Points:** 2

- [ ] Define all API tags in `DocumentBuilder` with descriptions:
  - `Auth` — User authentication and account management
  - `Exams` — Exam paper and content management
  - `Lessons` — Lesson management
  - `Subjects` — Subject catalogue
  - `Subject Topics` — Topics under each subject
  - `Subscription` — Subscription plans and user subscriptions
  - `Payment` — Payment initiation and receipts
  - `Stats — Admin` — Admin-level analytics and reporting
  - `Stats — Sales Manager` — Sales manager performance stats
  - `Stats — Teacher` — Teacher referral and student stats
- `Chat` — AI chatbot integration (Gemini)

---

## 🗂️ EPIC 11 — Testing

> **Tags:** `testing` `quality`

---

### STORY 11.1 — Unit Tests: Auth Service *(Day 8)*
**Points:** 5

- [ ] Write unit tests for `AuthService.login()` — happy path, wrong password, user not found
- [ ] Write unit tests for `AuthService.logout()` — session deleted
- [ ] Write unit tests for `AuthService.deviceLogout()` — only targeted session deleted (after fix)
- [ ] Write unit tests for `AuthService.checkAuthentication()` — valid session, expired session
- [ ] Write unit tests for `AuthService.deleteAccount()` — cascade order validated
- [ ] Mock `PrismaService` using Jest manual mocks

---

### STORY 11.2 — Unit Tests: Exams & Lessons Services *(Day 9)*
**Points:** 5

- [ ] Unit tests for `ExamsService` — all 10 methods with edge cases
- [ ] Unit tests for `LessonsService` — all 6 methods with edge cases
- [ ] Test pagination behaviour once implemented
- [ ] Test `NotFoundException` propagation

---

### STORY 11.3 — E2E Tests: Core Flows *(Day 10)*
**Points:** 5

- [ ] `POST /auth/login` — success and failure cases
- [ ] `GET /auth/authenticated` — valid and invalid sessions
- [ ] `POST /exams/addExamPaper` → `GET /exams/getExam/:id` → `DELETE /exams/:id` lifecycle
- [ ] `GET /stats/admin/total-stats` — requires admin JWT
- [ ] Set up `test/.env.test` with a test MongoDB connection string

---

## 🗂️ EPIC 12 — CI/CD & Deployment Readiness

> **Tags:** `devops` `ci-cd` `deployment`

---

### STORY 12.1 — GitHub Actions CI Pipeline *(Day 10)*
**Points:** 3

- [ ] Create `.github/workflows/ci.yml`
- [ ] Steps: checkout → install → security audit → lint → build → test
- [ ] Run on `push` to `main` and `pull_request` to `main`

---

### STORY 12.2 — Docker Setup *(Day 10)*
**Points:** 3

- [ ] Create `Dockerfile` (multi-stage build: build → production)
- [ ] Create `docker-compose.yml` with `api` service and a `mongo` service for local dev
- [ ] Add `.dockerignore`
- [ ] Update `README.md` with Docker setup instructions

---

### STORY 12.3 — README & Developer Onboarding Docs *(Day 10)*
**Points:** 2

- [ ] Rewrite `README.md`:
  - Project overview
  - Prerequisites
  - Environment variables reference (all required vars)
  - How to run locally (`npm run start:dev`)
  - How to run tests
  - Scalar documentation URL (`/reference`)
  - API versioning strategy

---

## 📅 Sprint Calendar

| Day | Focus |
|-----|-------|
| **Day 1 (Apr 17)** | Epics 1.1–1.4: Module fix, Config, JWT Guard, Error filter |
| **Day 2 (Apr 18)** | Epics 1.5–1.6, 2.1: Response interceptor, module refactor, Auth DTOs |
| **Day 3 (Apr 19)** | Epics 2.2–2.3, 3.1: Auth hardening + docs, Exams DTOs |
| **Day 4 (Apr 20)** | Epics 3.2–3.3, 4.1: Exams hardening + docs, Lessons DTOs |
| **Day 5 (Apr 21)** | Epics 4.2–4.3, 5.1: Lessons hardening + docs, Subjects impl |
| **Day 6 (Apr 22)** | Epics 5.2–5.3, 6.1: Topics impl, Subscription impl |
| **Day 7 (Apr 23)** | Epics 6.2, 7.1–7.2: Subscription docs, Payment impl + docs |
| **Day 8 (Apr 24)** | Epics 8.1–8.2, 11.1: Stats hardening, Auth unit tests |
| **Day 9 (Apr 25)** | Epics 8.3, 9.1–9.2, 10.1: Stats docs, Chat, Scalar install |
| **Day 10 (Apr 26)** | Epics 10.2–10.4: Swagger metadata audit, tag groupings |
| **Day 11 (Apr 27)** | Epics 11.2: Exams + Lessons unit tests |
| **Day 12 (Apr 28)** | Epics 11.3: E2E tests |
| **Day 13 (Apr 29)** | Epics 12.1–12.2: CI pipeline, Docker |
| **Day 14 (Apr 30)** | Epic 12.3 + Sprint review, QA, buffer |

---

## 📊 Story Point Summary

| Epic | Points |
|------|--------|
| Epic 1 — Foundation & Infrastructure | 18 |
| Epic 2 — Auth | 11 |
| Epic 3 — Exams | 11 |
| Epic 4 — Lessons | 11 |
| Epic 5 — Subjects & Topics | 16 |
| Epic 6 — Subscription | 11 |
| Epic 7 — Payment | 7 |
| Epic 8 — Stats | 13 |
| Epic 9 — Chat | 5 |
| Epic 10 — Scalar Docs | 15 |
| Epic 11 — Testing | 15 |
| Epic 12 — CI/CD & DevOps | 8 |
| **TOTAL** | **141** |

---

## 🚨 Known Issues to Flag in ClickUp (Bugs)

| # | Severity | Description |
|---|----------|-------------|
| B-1 | 🔴 P0 | `SubjectTopicService` imported from wrong path — app fails to start |
| B-2 | 🔴 P0 | No JWT guards applied anywhere — all endpoints are completely public |
| B-3 | 🟠 P1 | `GET` used for delete operations (e.g. `GET /exams/delete/examByID/:id`) — violates REST and HTTP semantics |
| B-4 | 🟠 P1 | `deviceLogout` deletes all sessions, not just the device's session |
| B-5 | 🟠 P1 | Dynamic column name in `updateExam` — SQL-injection-style risk on NoSQL |
| B-6 | 🟡 P2 | `Date.now().toString()` used as a primary key — collision risk under load |
| B-7 | 🟡 P2 | `app.module.ts` title is `'Hr Backend Api'` — leftover from a different project |
| B-8 | 🟡 P2 | `getExamContent` uses `findFirst` — only returns first content record per exam |
| B-9 | 🟡 P2 | Stats module duplicates exam content creation — `POST /stats/addExamContent` |
| B-10 | 🟡 P2 | `GET /stats/sales-manager/referral-count` missing `:id` param |
