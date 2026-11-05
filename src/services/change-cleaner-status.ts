import { UserRepository } from "@/repository/user-repository";
import { NotFoundException } from "@/util/exceptions/http/NotFoundException";


export class ChangeCleanerStatusService {
  static async changeCleanerStatus(
    cleanerId: string,
    newStatus: "active" | "inactive"
  ): Promise<void> {
    const cleaner = await UserRepository.findById(cleanerId);

    if (!cleaner) {
      throw new NotFoundException(`Cleaner with ID ${cleanerId} not found`);
    }

    await UserRepository.updateUser(cleanerId, { cleanerStatus: newStatus });
  }