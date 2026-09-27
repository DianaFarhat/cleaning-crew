import { prisma } from "@/lib/prisma";
import type { CreateUserData } from "@/types/user";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  create(data: CreateUserData) {
    return prisma.user.create({
      data,
      select: {
        userId: true,
        username: true,
        role: true,
        email: true,
        email_verified: true,
        phone_number: true,
        profile_image: true,
        cleaner_status: true,
        created_at: true,
        updated_at: true,
      },
    });
  },
};