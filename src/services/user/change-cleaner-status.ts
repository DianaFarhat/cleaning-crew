// src/services/user/change-cleaner-status.ts
import { UserRepository } from "@/repository/user-repository";
import { NotFoundException } from "@/util/exceptions/http/NotFoundException";
import { userSchema } from "@/types/user"; // CHECK: where userSchema lives

export async function changeCleanerStatus(
  cleanerId: string,
  newStatus: "active" | "inactive"
) {
  const cleaner = await UserRepository.findById(cleanerId);

  // missing, archived, or not a cleaner → 404
  if (!cleaner || cleaner.archivedAt || cleaner.role !== "cleaner") {
    throw new NotFoundException(`Cleaner with ID ${cleanerId} not found`);
  }

  const updated = await UserRepository.updateUser(cleanerId, { cleanerStatus: newStatus });
  return userSchema.parse(updated); // strips passwordHash
}