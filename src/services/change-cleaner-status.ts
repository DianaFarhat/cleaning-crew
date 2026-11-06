import { UserRepository } from "@/repository/user-repository";
import { NotFoundException } from "@/util/exceptions/http/NotFoundException";
import { BadRequestException } from "@/util/exceptions/http/BadRequestException";
import { userSchema, SafeUser } from "@/types/user";

export class ChangeCleanerStatusService {
  static async changeCleanerStatus(
    cleanerId: string,
    newStatus: "active" | "inactive"
  ): Promise<SafeUser> {
    const cleaner = await UserRepository.findById(cleanerId);

    // ① missing OR soft-deleted → 404
    if (!cleaner || cleaner.archivedAt) {
      throw new NotFoundException(`Cleaner with ID ${cleanerId} not found`);
    }

    // ② only cleaners have a status → 400
    if (cleaner.role !== "cleaner") {
      throw new BadRequestException("Target user is not a cleaner");
    }

    // ③ return the safe updated user
    const updated = await UserRepository.updateUser(cleanerId, {
      cleanerStatus: newStatus,
    });

    return userSchema.parse(updated);
  }
}