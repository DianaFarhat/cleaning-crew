// src/services/user/update-user-profile.ts
import { UserRepository } from "@/repository/user-repository";
import { NotFoundException } from "@/util/exceptions/http/NotFoundException";
import { type SafeUser, type UpdateUserProfileInput, userSchema } from "@/types/user";

export async function updateUserProfile(
  userId: string,
  data: UpdateUserProfileInput
): Promise<SafeUser> {
  // 1. Get the user
  const user = await UserRepository.findById(userId);

  // 2. Missing or archived → 404
  if (!user || user.archivedAt) {
    throw new NotFoundException(`User with ID ${userId} not found`);
  }

  // 3. Nothing to change ({} or only unknown fields) → return as is, no DB write
  if (Object.keys(data).length === 0) {
    return userSchema.parse(user);
  }

  // 4. Write only the fields that were sent
  const updated = await UserRepository.updateUser(userId, data);

  // 5. Return the safe user (strips passwordHash)
  return userSchema.parse(updated);
}