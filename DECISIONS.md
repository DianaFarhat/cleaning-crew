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

---

## ❓ Open questions (decide, then move up as a decision)

- [ ] Field naming: contract says `phone_number` (snake_case), code uses `phoneNumber` (camelCase). Leaning: make Swagger all camelCase.
- [ ] Validation error body: contract `errors: [{ field, message }]` vs code `details: { fieldErrors }`.
- [ ] URL prefix: contract `/v1/...` vs code `/api/...`.
- [ ] Admin-created cleaners: start with `emailVerified: true` so they can log in?
- [ ] Is anyone already building a frontend from the Swagger?
- [ ] Test tool: Vitest or Jest? Tests in `tests/` folder or next to the code?