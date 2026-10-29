# TODO

> Take the **top** card in "Now". Finish it. Move it to "Done". Repeat.

---

## 🟡 Now
- [ ] Copy system templates on register
  - [x] `user-repository.ts`: `createUser` accepts `db` (transaction)
  - [ ] New `repository/template-repository.ts`
  - [ ] New `services/template-service.ts`
  - [ ] `register-owner.ts`: wrap create + copy in `prisma.$transaction`
  - [ ] Postman: register → check the owner got their own copy of Standard Turnover + 9 tasks
- [ ] Run `npx prisma db seed` → confirm "Created system template: Standard Turnover"
- [ ] Postman: log in as `karim.aoun@gmail.com` / `123456789`

## ⬜ Next
- [ ] `npm ls tsx` → if empty, `npm i -D tsx`; add `"db:seed:system": "tsx prisma/seed-system.ts"` to package.json
- [ ] `POST /users` (create cleaner): paste code, Postman happy path
- [ ] Swagger: `POST /auth/register` mentions template copy
- [ ] Swagger: `GET /cleaning-session-templates` returns only the owner's own copies
- [ ] Prisma comment above `CleaningSessionTemplate`: system rows exist (`ownerId = null`, copy source)
- [ ] `GET /users/{userId}` (+ `UserRepository.findById`)
- [ ] `PATCH /users/{userId}` (+ `UserRepository.updateUser`)
- [ ] `PATCH /users/{userId}/status`
- [ ] `GET /users` (list, filters, stats) — biggest, last

## 🔜 Later
- [ ] Answer the open questions in `DECISIONS.md`, then sync code ↔ Swagger
- [ ] Auth: search `TODO(auth)` and protect every endpoint
- [ ] Login uses `emailInputSchema`
- [ ] Tests: pick tool + folder, add test files, run `npm test`
- [ ] Safety lock in `seed.ts`: refuse to run if `DATABASE_URL` isn't a dev database
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