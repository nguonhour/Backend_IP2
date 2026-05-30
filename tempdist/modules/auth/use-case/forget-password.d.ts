import { Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
export declare class ForgetPasswordDto {
    private readonly userRepo;
    constructor(userRepo: UserRepository);
    execute(email: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
