import { Logger } from '@nestjs/common';
import { Repository, ObjectLiteral, DeepPartial } from 'typeorm';
import { logErrorToFile } from '../logger/file-logger';

export abstract class BaseRepository<T extends ObjectLiteral> {
  protected logger = new Logger(this.constructor.name);

  constructor(protected repository: Repository<T>) {}

  /**
   * Wraps repository operations with error logging
   */
  protected async handleError(
    operation: string,
    error: any,
    metadata?: Record<string, any>,
  ) {
    this.logger.error(`[${operation}] ${error?.message || String(error)}`);
    try {
      logErrorToFile(error, {
        service: this.constructor.name,
        operation,
        ...metadata,
      });
    } catch (e) {
      this.logger.error('Failed to log error:', e);
    }
    throw error;
  }

  async findAll(relations?: string[]) {
    try {
      return await this.repository.find({ relations });
    } catch (error) {
      return this.handleError('findAll', error, { relations });
    }
  }

  async findById(id: string | number, relations?: string[]) {
    try {
      return await this.repository.findOne({
        where: { id } as any,
        relations,
      });
    } catch (error) {
      return this.handleError('findById', error, { id, relations });
    }
  }

  async create(data: DeepPartial<T>) {
    try {
      const entity = this.repository.create(data);
      return await this.repository.save(entity);
    } catch (error) {
      return this.handleError('create', error, { data });
    }
  }

  async update(id: string | number, data: Partial<T>) {
    try {
      await this.repository.update({ id } as any, data);
      return this.findById(id);
    } catch (error) {
      return this.handleError('update', error, { id, data });
    }
  }

  async delete(id: string | number) {
    try {
      const result = await this.repository.delete({ id } as any);
      return result.affected ?? 0;
    } catch (error) {
      return this.handleError('delete', error, { id });
    }
  }

  async save(entity: T) {
    try {
      return await this.repository.save(entity);
    } catch (error) {
      return this.handleError('save', error, { entity });
    }
  }

  async remove(entity: T) {
    try {
      return await this.repository.remove(entity);
    } catch (error) {
      return this.handleError('remove', error, { entity });
    }
  }
}
