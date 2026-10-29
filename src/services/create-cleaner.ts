import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { Prisma, UserRole } from "@/app/generated/prisma/client";
import { userSchema, type CreateCleanerInput, type SafeUser } from "@/types/user";
import { UserRepository } from "@/repository/user-repository";
import { ConflictException } from "@/util/exceptions/http/ConflictException";

// 🎲 12 random characters, e.g. "q3Zx-8Kp_LmA"
function generateTempPassword(): string {
  return randomBytes(9).toString("base64url");
}

// 1. Mapper: admin input → database data
function toCleanerCreateData(
  data: CreateCleanerInput,
  passwordHash: string
): Prisma.UserCreateInput {
  return {
    username: data.username,
    email: data.email,
    phoneNumber: data.phoneNumber,
    passwordHash,
    role: UserRole.cleaner,             // 🔒 this route only creates cleaners
    cleanerStatus: data.cleanerStatus,  // active / inactive, chosen by admin
    emailVerified: true,                // the temp password is sent to this email
    emailVerifiedAt: new Date(),
    passwordChangedAt: null,            // 🔁 forces a password change on first login
  };
}

// 2. Service: coordinates cleaner creation
export class CleanerCreationService {
  static async createCleaner(data: CreateCleanerInput): Promise<SafeUser> {
    // 💭 1. Email already taken?
    const existingUser = await UserRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    // 💭 2 + 3. Generate a temp password and hash it
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    try {
      // 💭 4. Save the cleaner
      const newCleaner = await UserRepository.createUser(
        toCleanerCreateData(data, passwordHash)
      );

      // 💭 5. TODO: deliver tempPassword to the cleaner (email/SMS).
      // Dev only, so you can log in as the cleaner in Postman:
      if (process.env.NODE_ENV !== "production") {
        console.log(`[dev] temp password for ${newCleaner.email}: ${tempPassword}`);
      }

      // 💭 7. Return a SafeUser (no passwordHash)
      return userSchema.parse(newCleaner);
    } catch (e) {
      // 💭 6. Lost the race on the email → 409, not 500
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new ConflictException("Email already exists");
      }
      throw e;
    }
  }
}