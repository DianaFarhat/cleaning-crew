import type { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/db";

export class UserRepository {
  
  static async findCredentialsByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { userId: true, passwordHash: true },
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

}