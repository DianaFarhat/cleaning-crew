import { HttpException } from "./HttpException";

export class ConflictException extends HttpException {
  constructor(message: string) {
    super(409, message);
    this.name = "ConflictException";
  }
}