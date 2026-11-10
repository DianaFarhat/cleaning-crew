import type { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/db";

export class UserRepository {

  static async findCredentialsByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { userId: true, passwordHash: true , archivedAt:true},
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async findById(userId: string) {
    return prisma.user.findUnique({
      where: { userId },
    });
  }

  static async createUser(
    data: Prisma.UserCreateInput,
    db: Prisma.TransactionClient = prisma
  ) {
    return db.user.create({ data });
  }

    static async updateUser(
    userId: string,
    data: Prisma.UserUpdateInput,
    db: Prisma.TransactionClient = prisma
  ) {
    return db.user.update({ where: { userId }, data });
  }
 
}

