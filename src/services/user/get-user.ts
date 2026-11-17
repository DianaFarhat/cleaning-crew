// src/services/user/get-user.ts
import { UserRepository } from "@/repository/user-repository";
import { NotFoundException } from "@/util/exceptions/http/NotFoundException";
import { type SafeUser, userSchema } from "@/types/user";

export async function getUser(userId: string): Promise<SafeUser> {
  const user = await UserRepository.findById(userId);

  // missing or archived → 404
  if (!user || user.archivedAt) {
    throw new NotFoundException(`User with ID ${userId} not found`);
  }

  return userSchema.parse(user); // strips passwordHash
}