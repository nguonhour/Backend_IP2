import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class GetMeUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepo.findByIdWithRole(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role?.name,
    };
  }
}