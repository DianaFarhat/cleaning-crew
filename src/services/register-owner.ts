// src/services/owner-registration-service.ts

import bcrypt from "bcrypt";
import { Prisma, UserRole } from "@/app/generated/prisma/client";
import { userSchema, type RegisterOwnerInput, type SafeUser } from "@/types/user";
import { UserRepository } from "@/repository/user-repository";
import { ConflictException } from "@/util/exceptions/http/ConflictException";

// 1. Mapper: transforms registration input into database data
function toOwnerCreateData(
  data: RegisterOwnerInput,
  passwordHash: string
): Prisma.UserCreateInput {
  return {
    username: data.username,
    email: data.email,
    phoneNumber: data.phoneNumber,
    passwordHash,
    role: UserRole.owner,
    emailVerified: false,
    cleanerStatus: null,
    profileImage: null,
  };
}

// 2. Service: coordinates the registration process
export class OwnerRegistrationService {
  static async registerOwner(
    data: RegisterOwnerInput
  ): Promise<SafeUser> {
    const existingUser = await UserRepository.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const newUser = await UserRepository.createUser(
      toOwnerCreateData(data, passwordHash)
    );

    // Next: return a SafeUser and initiate email verification
    return userSchema.parse(newUser);
  }
}