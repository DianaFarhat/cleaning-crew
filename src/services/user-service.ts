// services/user-service.ts
import bcrypt from 'bcryptjs';
import { UserRepository } from '@/repository/user-repository';
import { InvalidCredentialsException } from '@/util/exceptions/http/AuthenticationException';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async validateUser(email: string, password: string): Promise<string> {
    const creds = await this.userRepository.findCredentialsByEmail(email);

    // same error for "no user" and "wrong password" so attackers can't probe which emails exist
    if (!creds || !(await bcrypt.compare(password, creds.passwordHash))) {
      throw new InvalidCredentialsException();
    }
    return creds.userId;
  }
}