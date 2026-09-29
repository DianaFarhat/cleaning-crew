// repository/user-repository.ts
import prisma from '@/lib/db';

export class UserRepository {
  async findCredentialsByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { userId: true, passwordHash: true },
    });
  }
}