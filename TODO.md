# TODO

> Take the **top** card in "Now". Finish it. Move it to "Done". Repeat.

---

## 🐢 Learn properly (don't rush)
- [ ] Dynamic routes + route context (`[userId]`, `ctx.params`): first in `PATCH /users/{userId}/status`
- [ ] Pagination (`page`, `pageSize`, skip/take, `total`): first in `GET /users`

## 🟡 Now (next session, in this order)
1. [ ] 🧹 Finish `POST /users` (code reviewed ✅, just test)
   - [ ] Postman: create Lina → 201, `role: cleaner`, email lowercased, phone `+961…`
   - [ ] Check the `npm run dev` terminal for `[dev] temp password for …`
   - [ ] Postman: same email again → 409
   - [ ] Postman: register a new owner → 201 + own Standard Turnover (re-check after the `createUser` fix)
   - [ ] Commit
2. [ ] 🔁 `PATCH /users/{userId}/status` (NOT built yet) 🐢
   - [ ] `types/user.ts`: `updateCleanerStatusInputSchema` + `UpdateCleanerStatusInput`
   - [ ] `user-repository.ts`: `findById` + `updateUser` (with `db = prisma`)
   - [ ] `NotFoundException.ts` (if missing)
   - [ ] `services/update-cleaner-status.ts`
   - [ ] `app/api/users/[userId]/status/route.ts`
   - [ ] Postman: 200 / 404 (fake id) / 400 (owner id) / 400 (bad status)
3. [ ] 🔑 Postman: log in as `karim.aoun@gmail.com` / `123456789`

## ⬜ Next
- [ ] `GET /users/{userId}`
- [ ] `PATCH /users/{userId}` (+ `UserRepository.updateUser`, already added for status)
- [ ] `GET /users` (list, filters, stats) — biggest, last 🐢 pagination
- [ ] `npm ls tsx` → if empty, `npm i -D tsx`; add `"db:seed:system": "tsx prisma/seed-system.ts"` to package.json
- [ ] Swagger: `POST /auth/register` mentions template copy
- [ ] Swagger: `GET /cleaning-session-templates` returns only the owner's own copies
- [ ] Prisma comment above `CleaningSessionTemplate`: system rows exist (`ownerId = null`, copy source)
- [ ] Decide API versioning (`/api` vs `/api/v1`) before building more endpoints (see DECISIONS.md open questions)

## 🚀 Before launch (must be done before real users)
- [ ] Auth on every endpoint (search `TODO(auth)`)
- [ ] Email infrastructure (search `TODO(email-infra)`), remove the dev temp-password log
- [ ] Separate Railway DBs (prod vs dev) + seed lock (refuse to wipe unless `ALLOW_DB_WIPE=true`)
- [ ] Rate limit public endpoints (register, login, forgot-password)
- [ ] Fix tsconfig `"ignoreDeprecations": "6.0"` mismatch

## 🔜 Later
- [ ] 📧 Email infrastructure (build once, used everywhere)
  - [ ] Pick a provider (Resend / SendGrid / SES / SMTP) + API key in `.env`
  - [ ] `EmailService` with one `send()` function
  - [ ] Verify email after register
  - [ ] Forgot / reset password (token link)
  - [ ] Cleaner invite: link to set their own password (reuses the reset-password token flow) → remove temp password + dev `console.log`
- [ ] 🗄️ Soft delete + archive (decided 2026-10-29)
  - [ ] Migration: `deletedAt` on User, `archivedAt` on Chalet, `onDelete: Cascade` on TaskImage → CleaningSessionTask
  - [ ] Login refuses users with `deletedAt` set
  - [ ] User lists hide `deletedAt`; chalet lists hide `archivedAt`
  - [ ] Register: deleted account's email → 409 "account deleted, use Forgot password to restore it"
  - [ ] Forgot password: also works for deleted accounts
  - [ ] Reset password: also clears `deletedAt` (reactivation, no template re-copy)
  - [ ] Swagger: "delete my account" + "archive chalet" endpoints
- [ ] 🔑 Fix login (review 2026-10-30)
  - [ ] Zod `loginInputSchema` with `emailInputSchema` + try/catch JSON read
  - [ ] Wrong password / unknown email → 401, not 500 (no message-string matching)
  - [ ] Route only knows the service (no `new UserRepository()` in the route)
  - [ ] Service returns tokens; route sets cookies
  - [ ] Swagger: decide cookies vs body for tokens; check 403 rules
- [ ] Tests: pick tool + folder, add test files, run `npm test`
- [ ] Decimal fields (`hourlyRate`, `totalCost`, lat/long) → numbers in JSON
- [ ] `@db.Date` / `@db.Time` → `"2026-07-15"` / `"10:00"` in JSON
- [ ] Add `updatedAt` to `CleaningSessionTemplate` + `TemplateTask` (Swagger returns it)
- [ ] Indexes: `CleaningSessionTask(cleaningSessionId)`, `Notification(userId)`
- [ ] Optional: services throw service errors instead of HTTP errors

## ✅ Done
- [x] Race condition on register → 409 instead of 500
- [x] Email normalization
- [x] Lebanese phone with `libphonenumber-js`
- [x] Password max 72, `profileImage` no longer crashes responses
- [x] Register route: one error format, honest bad-JSON message, 400
- [x] Swagger v1.7.0: 400 convention on all 45 endpoints
- [x] System seed: `prisma/system-templates.ts` + `prisma/seed-system.ts` (Standard Turnover)
- [x] System seed is idempotent (verified: 2nd run skipped)
- [x] Dev seed re-creates system templates after its wipe
- [x] Seeded users have a real password hash (dev password `123456789`)
- [x] Archiving vs deleting → decided (see DECISIONS.md, 2026-10-29)
- [x] Owner gets a copy of the system template on register (transaction: user + template + 9 tasks; verified in Prisma Studio)
- [x] `createUser` joins transactions correctly (`db = prisma` default, body uses `db`)
- [x] `POST /users` (create cleaner): route + service written and reviewed
- [x] `create-cleaner.ts` cleaned up (same style as register, `TODO(email-infra)` tag)
- [x] Register + create-cleaner fully reviewed (routes, services, repositories, races)
- [x] Swagger v1.7.1: validation error body matches code (`details.fieldErrors`)
- [x] Swagger v1.8.0: all fields + query params camelCase
- [x] Swagger v1.9.0: server URLs use `/api` (matches Next.js routes)