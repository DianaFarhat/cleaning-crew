# TODO

## 🔨 Now: PATCH /users/{userId}/status
- [x] Add `archivedAt` to User + migration
- [x] Service `services/user/change-cleaner-status.ts` (plain function, 404 rules, returns safe user)
- [x] Route `api/users/[userId]/status/route.ts` (UUID check, body validation)
- [x] Export `RouteContext` from `withErrorHandler.ts`
- [x] Works in Postman (200)
- [ ] Run the remaining Postman cases: repeat request (200), random UUID (404), `abc` (400), owner id (404), bad status (400), broken JSON (400)
- [ ] `npm run build` passes
- [ ] Check `git status`: nothing from `src/app/generated/` is staged
- [ ] Commit
- [ ] Update Swagger: status endpoint body `cleanerStatus`, 200 + user, 404 for non-cleaners

## 🧹 Cleanup from the services refactor
- [ ] Confirm `userSchema` import path in `change-cleaner-status.ts`
- [ ] `findCredentialsByEmail`: static, and selects `archivedAt` (needed by `validate-user.ts`)
- [ ] Use the same bcrypt cost for the dummy hash as for real passwords
- [ ] Remove email normalization in `validate-user.ts` if the login schema already does it
- [ ] Delete old `services/user-service.ts`
- [ ] Later: rename `authentication-service.ts` to an action name
- [ ] Later (optional): move `register-owner.ts` to `services/auth/`

## ⏭️ Next
- [ ] `GET /users` with pagination (slow down and learn pagination properly)
- [ ] Soft delete / reactivation flow uses `archivedAt` (register 409, forgot + reset password)
- [ ] Inactive cleaners can't log in (403)

## 🚀 Before launch (must be done before real users)
- [ ] Auth on every endpoint (search `TODO(auth)`)
- [ ] Email infrastructure (search `TODO(email-infra)`), remove dev temp-password log
- [ ] Cleaner invite link replaces the temp password
- [ ] Separate Railway DBs (prod vs dev) + seed lock (`ALLOW_DB_WIPE`)
- [ ] Fix tsconfig `"ignoreDeprecations": "6.0"` mismatch
- [ ] Cascade: TaskImage → CleaningSessionTask