import bcrypt from "bcrypt";
import { Prisma, UserRole } from "@/app/generated/prisma/client";
import prisma from "@/lib/db"; // 🆕
import { userSchema, type RegisterOwnerInput, type SafeUser } from "@/types/user";
import { UserRepository } from "@/repository/user-repository";
import { TemplateService } from "@/services/template-service"; // 🆕
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
  static async registerOwner(data: RegisterOwnerInput): Promise<SafeUser> {
    const existingUser = await UserRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    try {
      // 🆕 all-or-nothing: create owner + copy system templates
      const newUser = await prisma.$transaction(async (tx) => {
        const user = await UserRepository.createUser(
          toOwnerCreateData(data, passwordHash),
          tx
        );
        await TemplateService.copySystemTemplatesToOwner(user.userId, tx);
        return user;
      });

      return userSchema.parse(newUser);
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