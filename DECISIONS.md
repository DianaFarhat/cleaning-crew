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

---

## ❓ Open questions (decide, then move up as a decision)

- [ ] Field naming: contract says `phone_number` (snake_case), code uses `phoneNumber` (camelCase). Leaning: make Swagger all camelCase.
- [ ] Validation error body: contract `errors: [{ field, message }]` vs code `details: { fieldErrors }`.
- [ ] URL prefix: contract `/v1/...` vs code `/api/...`.
- [ ] Admin-created cleaners: start with `emailVerified: true` so they can log in?
- [ ] Is anyone already building a frontend from the Swagger?
- [ ] Test tool: Vitest or Jest? Tests in `tests/` folder or next to the code?
