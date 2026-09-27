import { userRepository } from "@/repository/user";
import type { CreateCleanerInput } from "@/types/user";

export async function createCleaner(input: CreateCleanerInput) {
  // 1. Check email doesn't already exist
  const existingUser = await userRepository.findByEmail(input.email);

  if (existingUser) {
    throw new EmailAlreadyExistsError();
  }

  // 2. Generate temporary password
  const tempPassword = generateTemporaryPassword();

  // 3. Hash password
  const passwordHash = await hashPassword(tempPassword);

  // 4. Tell repository what to create
  const cleaner = await userRepository.create({
    username: input.username,
    email: input.email,
    phone_number: input.phone_number,
    cleaner_status: input.cleaner_status,

    // Business rules — NOT supplied by client
    role: "cleaner",
    password_hash: passwordHash,
    password_changed_at: null,
  });

  return cleaner;
}