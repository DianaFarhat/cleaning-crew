# TODO

> Take the **top** card in "Now". Finish it. Move it to "Done". Repeat.

---

## 🟡 Now (this session, in this order)
1. [x] 🧠 Archiving vs deleting → decided (see DECISIONS.md, 2026-10-29)
2. [ ] 📋 Owner gets a copy of the system template on register
   - [x] `user-repository.ts`: `createUser` accepts `db` (transaction)
   - [ ] New `repository/template-repository.ts`
   - [ ] New `services/template-service.ts`
   - [ ] `register-owner.ts`: wrap create + copy in `prisma.$transaction`
   - [ ] Postman: register → owner has their own Standard Turnover + 9 tasks
3. [ ] 🧪 Test + build the next endpoint
   - [ ] Postman: log in as `karim.aoun@gmail.com` / `123456789`
   - [ ] `POST /users` (create cleaner): paste code, Postman happy path

## ⬜ Next
- [ ] `npm ls tsx` → if empty, `npm i -D tsx`; add `"db:seed:system": "tsx prisma/seed-system.ts"` to package.json
- [ ] Swagger: `POST /auth/register` mentions template copy
- [ ] Swagger: `GET /cleaning-session-templates` returns only the owner's own copies
- [ ] Prisma comment above `CleaningSessionTemplate`: system rows exist (`ownerId = null`, copy source)
- [ ] `GET /users/{userId}` (+ `UserRepository.findById`)
- [ ] `PATCH /users/{userId}` (+ `UserRepository.updateUser`)
- [ ] `PATCH /users/{userId}/status`
- [ ] `GET /users` (list, filters, stats) — biggest, last

## 🔜 Later
- [ ] 🗄️ Soft delete + archive (decided 2026-10-29)
  - [ ] Migration: `deletedAt` on User, `archivedAt` on Chalet, `onDelete: Cascade` on TaskImage → CleaningSessionTask
  - [ ] Login refuses users with `deletedAt` set
  - [ ] User lists hide `deletedAt`; chalet lists hide `archivedAt`
  - [ ] Register: deleted account's email → 409 "account deleted, use Forgot password to restore it"
  - [ ] Forgot password: also works for deleted accounts
  - [ ] Reset password: also clears `deletedAt` (reactivation, no template re-copy)
  - [ ] Swagger: "delete my account" + "archive chalet" endpoints
- [ ] Answer the open questions in `DECISIONS.md`, then sync code ↔ Swagger
- [ ] Auth: search `TODO(auth)` and protect every endpoint
- [ ] Login uses `emailInputSchema`
- [ ] Tests: pick tool + folder, add test files, run `npm test`
- [ ] Before deploying: separate Railway DBs (prod vs dev) + seed lock (refuse to wipe unless `ALLOW_DB_WIPE=true`)
- [ ] Fix tsconfig `"ignoreDeprecations": "6.0"` mismatch (before deploying)
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