import { Logger } from '@nestjs/common';
import { Repository, ObjectLiteral, DeepPartial } from 'typeorm';
export declare abstract class BaseRepository<T extends ObjectLiteral> {
    protected repository: Repository<T>;
    protected logger: Logger;
    constructor(repository: Repository<T>);
    protected handleError(operation: string, error: any, metadata?: Record<string, any>): Promise<void>;
    findAll(relations?: string[]): Promise<void | T[]>;
    findById(id: string | number, relations?: string[]): Promise<void | T | null>;
    create(data: DeepPartial<T>): Promise<void | T>;
    update(id: string | number, data: Partial<T>): Promise<void | T | null>;
    delete(id: string | number): Promise<number | void>;
    save(entity: T): Promise<void | T>;
    remove(entity: T): Promise<void | T>;
}
