# Decisions

> One entry per decision: **what** we decided and **why**.
> Newest at the bottom. Never delete — if something changes, add a new entry that replaces the old one.

---

## 2026-10-23 · Duplicate emails are blocked by the database
- `email` is `@unique` in Prisma; the DB guarantees no duplicates (atomic).
- Services keep `findByEmail` as a fast, friendly early check, **and** catch Prisma `P2002` → 409.
- Why: check-then-insert has a race condition; only the DB can make it safe.

## 2026-10-23 · Emails are trimmed + lowercased on input
- `emailInputSchema` in `types/user.ts`, used by every input schema (register, create cleaner, login).
- Why: `Ali@Mail.com` and `ali@mail.com` must be the same account.

## 2026-10-23 · Phones: Lebanese mobiles only, stored in E.164
- `libphonenumber-js/max` in `lib/validation/phone.ts` (`lebanesePhoneInputSchema`).
- Accepts `03 123 456`, `+961 3 123 456`, `00961…`, dashes; stores `+9613123456`.
- Why: one format everywhere, library knows the real prefixes.

## 2026-10-23 · Phone numbers are NOT unique
- Two accounts may share a phone number.

## 2026-10-23 · Passwords: 8–72 characters
- Why: bcrypt ignores everything past 72 bytes.

## 2026-10-23 · Validate data coming IN, not data going OUT
- Input schemas validate strictly; `userSchema` (DB → response) only picks safe fields (drops `passwordHash`).
- Why: re-validating saved data crashes responses (500) when old rows don't match new rules.

## 2026-10-26 · 400 for all bad input — no 422
- Broken JSON, failed validation, and business-rule rejections all return 400.
- Every error body: `{ "error": "message" }` (+ field list on validation failures).
- Why: simpler; one code for the frontend. Swagger updated to v1.7.0 to match.

## 2026-10-26 · No shared `parseBody` helper
- Each route reads JSON + validates with Zod itself (same pattern as register).
- Consequence: if the error format changes, update every route (search `z.flattenError`).

## 2026-10-26 · Build user endpoints without auth for now
- Every unprotected endpoint gets a `// TODO(auth)` comment.
- Do **not** deploy until auth is added.

## 2026-10-27 · System templates are copied to each owner at signup
- System templates = `ownerId = null`, masters, never edited by owners.
- On register, every active system template (+ active tasks) is copied to the new owner, in the **same transaction** as creating the user.
- Owners only see and edit their own copies.
- Why: owners can customize freely without touching the masters.

## 2026-10-29 · Repositories can join a transaction
- Repository methods that write take an optional `db: Prisma.TransactionClient = prisma`.
- Normal calls use `prisma`; inside `prisma.$transaction(async (tx) => …)` we pass `tx`.
- Why: several writes (user + template copies) must succeed or fail together.

## 2026-10-29 · Two seeds: system vs dev
- `prisma/seed-system.ts` (+ data in `prisma/system-templates.ts`): system templates only. Never deletes; safe in production. Run: `npx tsx prisma/seed-system.ts`.
- `prisma/seed.ts` (dev only): wipes the whole DB, re-runs `seedSystemTemplates`, then builds the fake test world. Run: `npx prisma db seed` (also runs on `prisma migrate reset`).
- Why: production needs system templates but must never get fake data or a wipe.

## 2026-10-29 · The system seed is idempotent
- Before creating, it checks for `ownerId = null` + same name; if found, it skips.
- Running it 10 times = running it once. Verified (2nd run printed "skipping").

## 2026-10-29 · System templates never change after release
- Need something different? Add a **new** system template; never edit an existing one.
- So the seed skips a template entirely if it exists (new tasks on an old template would not be added).

## 2026-10-29 · Starter system template: Standard Turnover only
- 9 tasks: beds 📸, towels, bathroom 📸, counters, dishes, fridge 📸, floors, bins, terrace.
- `room` is free text → always use the same spelling (`Bedroom`, `Bathroom`, `Kitchen`, `Whole chalet`, `Outdoor`).
- Why: start small; owners edit their own copies.

## 2026-10-29 · Dev seed wipes the database → local/dev only
- `seed.ts` deletes everything in whatever `DATABASE_URL` points to.
- Never run it against a shared or production database; check `.env` first.

## 2026-10-29 · Dev DB is hosted on Railway (dev stage)
- The seed safety lock can't check for `localhost` → use an explicit flag (`ALLOW_DB_WIPE=true`) before deploying.
- Before going live: separate prod and dev databases.

## 2026-10-29 · All seeded dev users share one password
- `DEV_PASSWORD = "123456789"` in `prisma/seed.ts`, bcrypt-hashed once and reused.
- Why: any seeded user can log in for testing. Dev seed only.

## 2026-10-29 · Nothing with history is ever hard-deleted
- Chalets → `archivedAt` (hidden from lists, row stays).
- Users can delete their account → **soft delete**: `deletedAt` is set, they can't log in, they're hidden from lists. The row stays.
- Cleaners can also be deactivated by admin (`cleanerStatus: inactive`).
- Templates/tasks → `archivedAt`. Sessions → `cancelled`.
- Why: past sessions and payment records must always stay intact.

## 2026-10-29 · Cascade only where the parent can be hard-deleted
- Keep the DB default (refuse to delete a parent that still has children): it protects money history.
- Cascade only on: AvailabilitySlot → User (exists), TaskImage → CleaningSessionTask (to add; upcoming session tasks can be hard-deleted).

## 2026-10-29 · Signing up again with a deleted account's email = reactivation (via forgot password)
- `POST /auth/register` with a deleted account's email → 409 "This account was deleted. Use 'Forgot password' to restore it."
- `POST /auth/forgot-password` also sends the link to deleted accounts.
- `POST /auth/reset-password` sets the new password **and** clears `deletedAt` → all history is back.
- Reactivated owners do NOT get the system templates copied again (they keep their old copies).
- Why: proves the person owns the inbox; no new APIs needed.

## 2026-10-29 · The route decides the role, never the body
- Owners: `POST /auth/register` (public) → always `owner`.
- Cleaners: `POST /users` (admin) → always `cleaner`.
- Both share `UserRepository`, the `User` table, and `userSchema`; routes, input schemas, and services are separate.
- Why: nobody can make themselves an admin or cleaner by sending `"role": "admin"`.

## 2026-10-29 · Admin-created cleaners start verified + get a temp password
- `emailVerified: true` + `emailVerifiedAt: now` (the password is delivered to that email, which proves ownership).
- Temp password: 12 random chars, hashed; `passwordChangedAt = null` forces a change on first login.
- Dev only: the temp password is printed in the server terminal.

## 2026-10-29 · Cleaner onboarding: invite link (planned)
- Later: admin creates cleaner → email with a one-time "set your password" link (same token flow as reset password); temp password removed.
- Why: a password never sits in an inbox; reuses code we need for forgot password anyway.

## 2026-10-29 · Cleaner status lifecycle
- Admin picks `active` or `inactive` when creating a cleaner (`POST /users`), and can change it any time via `PATCH /users/{userId}/status`.
- Inactive = can't log in (403) and is never auto-assigned. History stays.
- Only cleaners have a status: changing it on an owner/admin → 400 "Target user is not a cleaner".

## 2026-10-30 · N-tier rules (how the layers talk)
- Route: reads + validates the request, calls **one service**, sends the response. Knows nothing about repositories or Prisma.
- Service: business rules + mapping input → DB data. Never touches `Request`, `Response`, or cookies (it returns data; the route sets cookies).
- Repository: the only layer that talks to the DB. Pick it by the **table** it queries (`TemplateRepository` for templates, even when filtering by owner).
- Input → DB mapping (mapper) lives in the service, with explicit fields. Output shape lives once in `types/user.ts` (`userSchema` / `SafeUser`), so every service returns the same safe user.
- Services are one file per use case (`register-owner.ts`, `create-cleaner.ts`, …) using static classes.

## 2026-10-30 · Keep transactions short
- Do slow work (bcrypt hashing) **before** `prisma.$transaction`, then open → write → close.
- Inside a transaction, every repository call must receive `tx` (an optional `db` param compiles fine without it, so check by eye).

## 2026-10-30 · 409 stays separate from 400
- 400 = the input itself is bad (broken JSON, failed validation, business rule).
- 409 = valid input that clashes with existing data (email already taken, including the race case via `P2002`).

## 2026-10-30 · Validation error body = Zod's flattened error
- 400 validation responses: `{ "error": "Validation failed", "details": { "formErrors": [...], "fieldErrors": { "<field>": [...] } } }`.
- Swagger v1.7.1 updated to match the code (no code changes).
- Why: the code was already consistent; cheapest fix.

## 2026-10-30 · Stubs: finish the feature, stub its dependencies
- Ship the endpoint working end-to-end; shared infrastructure it depends on (e.g. email) becomes its own task.
- Every stub is tagged and findable: `// TODO(auth)`, `// TODO(email-infra)`.
- Every stub is guarded so it can't reach production (e.g. `NODE_ENV !== "production"`), and listed under "Before launch" in `TODO.md`.

## 2026-10-30 · camelCase everywhere in code and API
- JSON fields and query params: camelCase (`phoneNumber`, `includeStats`). Swagger v1.8.0 converted.
- DB columns stay snake_case via Prisma `@map`. Enum values stay as stored (`in_progress`, `session_assigned`).
- Why: TypeScript convention; same names from Prisma to JSON, no mapping layer.

## 2026-10-30 · URL prefix is /api (follows Next.js routes)
- Swagger servers: `http://localhost:3000/api`, `https://api.yallacrew.com/api` (v1.9.0).
- Why: matches `src/app/api/...` with no rewrites.
- Versioning (`/api/v1`) not decided yet: see open questions.

## 2026-11-01 · No API versioning: routes stay at `/api/...`
- The app is web only; no mobile app or outside clients planned.
- Replaces the "not decided yet" note in the 2026-10-30 URL prefix entry.
- Why: versioning only pays off when clients we don't control depend on the API.

## 2026-11-04 · `PATCH /users/{userId}/status` sets an explicit status (no toggle)
- Body says the target status (`active` / `inactive`); the server sets exactly that, never "flip whatever it is now".
- Why: idempotent. A double click or a retry gives the same result; a toggle would flip it back.

## 2026-11-05 · `withErrorHandler` types `ctx` as `RouteContext`
- `type RouteContext = { params: Promise<Record<string, string>> }`, replacing `ctx?: unknown`.
- The wrapper already forwarded `ctx` at runtime; only the type was blocking `ctx.params`.
- Dynamic routes read `const { userId } = await ctx.params;` with no casts. Routes without params just ignore `ctx`.
- Why: fixed once in the wrapper instead of a workaround in every `[param]` route.

## 2026-11-06 · Users are soft-deleted with `archivedAt` (not `deletedAt`)
- `User.archivedAt DateTime?` (migration `add_user_archived_at`).
- Replaces `deletedAt` in the 2026-10-29 entries: soft delete sets `archivedAt`; `reset-password` clears `archivedAt`.
- Why: one name for "hidden but kept" across users, chalets, templates and tasks.

## 2026-11-06 · Dev DB stays on Railway (Hobby plan)
- Upgraded after the trial expired; data survived (no reset needed).
- Commit `schema.prisma` and its migration folder together, never the schema alone.

## 2026-11-07 · Services: one folder per area, one file per use case, plain functions
- `services/auth/` = authentication (login, registration, credential checks): `validate-user.ts`, …
- `services/user/` = admin actions on users: `create-cleaner.ts`, `change-cleaner-status.ts`.
- `services/template/` = templates.
- Files are named after the action (not "…-service"), and export plain functions (no static classes).
- Replaces "using static classes" in the 2026-10-30 N-tier entry.
- Why: small files with one job, grouped like the repositories, easy to find.

## 2026-11-07 · No `index.ts` barrel files in services
- Routes import use-case files directly (`@/services/user/change-cleaner-status`).
- Why: barrels aren't needed in Next.js, can cause circular imports, and load extra code.

## 2026-11-07 · URL params are validated with Zod like the body
- `[userId]` → `z.uuid()`; a non-UUID id → 400 instead of a Prisma 500.
- `RouteContext` is exported from `withErrorHandler.ts` so routes can type `ctx`.

## 2026-11-07 · Status change on a non-cleaner → 404 (not 400)
- Missing, archived, or non-cleaner user → 404 "Cleaner with ID … not found".
- Replaces the 400 "Target user is not a cleaner" in the 2026-10-29 status lifecycle entry.
- Why: from this endpoint's point of view, that cleaner doesn't exist; and it doesn't reveal which ids belong to owners/admins.

## 2026-11-07 · `PATCH /users/{userId}/status` returns 200 + the updated cleaner
- Body: `{ "cleanerStatus": "active" | "inactive" }`.
- Response: the safe user (`userSchema`, no `passwordHash`), same as other user endpoints.

## 2026-11-07 · Login gives one answer for every failure
- No user, wrong password, or archived account → the same 401 `InvalidCredentialsException`.
- bcrypt always runs: when no user is found, it compares against a dummy hash (same cost as real hashes).
- Why: attackers can't tell which emails are registered, not by the message and not by response time.

## 2026-11-07 · `GET /users/{userId}`: archived users → 404
- Missing or archived → 404 "User with ID … not found". Any role can be fetched (not only cleaners).
- Access (when auth exists): admin can view any user; everyone else only their own `userId` (403 otherwise).
- Returns `SafeUser` for every caller for now; whether admin sees fewer fields than the user themselves is revisited when auth exists (data minimization).
- Why: same rule as the status endpoint; archived = hidden.

---

## ❓ Open questions (decide, then move up as a decision)

- [ ] Is anyone already building a frontend from the Swagger?
- [ ] Test tool: Vitest or Jest? Tests in `tests/` folder or next to the code?
- [ ] Login tokens: cookies (current code) or in the response body (current Swagger)?
- [ ] Should admin see fewer user fields than the user sees about themselves? (go through `userSchema` field by field)