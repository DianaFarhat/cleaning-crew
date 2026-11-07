import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { Prisma, UserRole } from "@/app/generated/prisma/client";
import { userSchema, type CreateCleanerInput, type SafeUser } from "@/types/user";
import { UserRepository } from "@/repository/user-repository";
import { ConflictException } from "@/util/exceptions/http/ConflictException";

// Generates a 12-character random temporary password
function generateTempPassword(): string {
  return randomBytes(9).toString("base64url");
}

// 1. Mapper: transforms admin input into database data
function toCleanerCreateData(
  data: CreateCleanerInput,
  passwordHash: string
): Prisma.UserCreateInput {
  return {
    username: data.username,
    email: data.email,
    phoneNumber: data.phoneNumber,
    passwordHash,
    role: UserRole.cleaner,
    cleanerStatus: data.cleanerStatus,
    emailVerified: true,
    emailVerifiedAt: new Date(),
    passwordChangedAt: null, // forces a password change on first login
  };
}

// 2. Service: coordinates the cleaner creation process
export class CleanerCreationService {
  static async createCleaner(data: CreateCleanerInput): Promise<SafeUser> {
    const existingUser = await UserRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    try {
      const newCleaner = await UserRepository.createUser(
        toCleanerCreateData(data, passwordHash)
      );

      // TODO(email-infra): deliver tempPassword by email, then remove this log
      if (process.env.NODE_ENV !== "production") {
        console.log(`[dev] temp password for ${newCleaner.email}: ${tempPassword}`);
      }

      return userSchema.parse(newCleaner);
    } catch (e) {
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