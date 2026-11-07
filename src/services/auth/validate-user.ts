// services/user/validate-user.ts
import bcrypt from "bcryptjs";
import { UserRepository } from "@/repository/user-repository";
import { InvalidCredentialsException } from "@/util/exceptions/http/AuthenticationException";

// Hashed once at startup. Used when no user is found, so both paths take the same time.
// Cost (10) must match the cost you use when hashing real passwords.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-never-matches", 10);

export async function validateUser(email: string, password: string): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();

  const creds = await UserRepository.findCredentialsByEmail(normalizedEmail);

  // Always run bcrypt, even with no user, to prevent timing-based email probing
  const passwordOk = await bcrypt.compare(password, creds?.passwordHash ?? DUMMY_HASH);

  // Same error for every failure: no user, wrong password, or archived account
  if (
    !creds ||
    !passwordOk ||
    ("archivedAt" in creds && creds.archivedAt)
  ) {
    throw new InvalidCredentialsException();
  }

  return creds.userId;
}