# TODO

## 🔨 Now: finish PATCH /users/{userId}/status
- [x] Add `archivedAt` to User + migration
- [x] Service `services/user/change-cleaner-status.ts` (plain function, 404 rules, returns safe user)
- [x] Route `api/users/[userId]/status/route.ts` (UUID check, body validation)
- [x] Export `RouteContext` from `withErrorHandler.ts`
- [x] Works in Postman (200)
- [ ] `user-repository`: `findCredentialsByEmail` selects `archivedAt` (otherwise archived users can log in)
- [ ] `change-cleaner-status`: use Prisma `CleanerStatus` enum instead of `"active" | "inactive"`
- [ ] Remove `// CHECK` comment in `change-cleaner-status.ts`
- [ ] Format `user-repository.ts` (Shift+Alt+F)
- [ ] (Optional) `Promise<SafeUser>` return type on `changeCleanerStatus` (readability only)
- [ ] Remaining Postman cases: repeat request (200), random UUID (404), `abc` (400), owner id (404), bad status (400), broken JSON (400)
- [ ] Update Swagger: body `cleanerStatus`, 200 + user, 404 for non-cleaners

## 🔨 Now: GET /users/{userId}
- [x] Route `api/users/[userId]/route.ts`
- [x] Service `services/user/get-user.ts` (missing or archived → 404)
- [ ] Postman: real id (200, no `passwordHash`), random UUID (404), `abc` (400), archived id (404)
- [ ] Update Swagger: 404 for archived, 400 for non-UUID

## 📦 Before committing
- [ ] `npm run build` passes
- [ ] `git status`: nothing from `src/app/generated/` is staged
- [ ] Commit (code + DECISIONS.md + TODO.md)

## 🧹 Cleanup from the services refactor
- [ ] Use the same bcrypt cost for the dummy hash as for real passwords (`validate-user.ts`)
- [ ] Remove email normalization in `validate-user.ts` if the login schema already does it
- [ ] Delete old `services/user-service.ts`
- [ ] Later: rename `authentication-service.ts` to an action name
- [ ] Later (optional): move `register-owner.ts` to `services/auth/`

## ⏭️ Next endpoints
- [ ] `PATCH /users/{userId}` (user edits own profile), same `[userId]/route.ts` file as GET
- [ ] `GET /users` with pagination (slow down and learn pagination properly)
- [ ] Availability slots (4 endpoints under `/users/{userId}/availability-slots`)
- [ ] Add "delete my account" (soft delete with `archivedAt`) to Swagger
- [ ] Soft delete / reactivation flow uses `archivedAt` (register 409, forgot + reset password)
- [ ] Inactive cleaners can't log in (403): `findCredentialsByEmail` will need `role` + `cleanerStatus`
- [ ] Later, after sessions exist: `cleaner-dashboard`, `earnings-summary`

## 🚀 Before launch (must be done before real users)
- [ ] Auth on every endpoint (search `TODO(auth)`)
- [ ] Decide admin vs self view of a user (data minimization), then apply in `get-user.ts`
- [ ] Email infrastructure (search `TODO(email-infra)`), remove dev temp-password log
- [ ] Cleaner invite link replaces the temp password
- [ ] Separate Railway DBs (prod vs dev) + seed lock (`ALLOW_DB_WIPE`)
- [ ] Fix tsconfig `"ignoreDeprecations": "6.0"` mismatch
- [ ] Cascade: TaskImage → CleaningSessionTask