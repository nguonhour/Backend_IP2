"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const common_1 = require("@nestjs/common");
const file_logger_1 = require("../logger/file-logger");
class BaseRepository {
    repository;
    logger = new common_1.Logger(this.constructor.name);
    constructor(repository) {
        this.repository = repository;
    }
    async handleError(operation, error, metadata) {
        this.logger.error(`[${operation}] ${error?.message || String(error)}`);
        try {
            (0, file_logger_1.logErrorToFile)(error, {
                service: this.constructor.name,
                operation,
                ...metadata,
            });
        }
        catch (e) {
            this.logger.error('Failed to log error:', e);
        }
        throw error;
    }
    async findAll(relations) {
        try {
            return await this.repository.find({ relations });
        }
        catch (error) {
            return this.handleError('findAll', error, { relations });
        }
    }
    async findById(id, relations) {
        try {
            return await this.repository.findOne({
                where: { id },
                relations,
            });
        }
        catch (error) {
            return this.handleError('findById', error, { id, relations });
        }
    }
    async create(data) {
        try {
            const entity = this.repository.create(data);
            return await this.repository.save(entity);
        }
        catch (error) {
            return this.handleError('create', error, { data });
        }
    }
    async update(id, data) {
        try {
            await this.repository.update({ id }, data);
            return this.findById(id);
        }
        catch (error) {
            return this.handleError('update', error, { id, data });
        }
    }
    async delete(id) {
        try {
            const result = await this.repository.delete({ id });
            return result.affected ?? 0;
        }
        catch (error) {
            return this.handleError('delete', error, { id });
        }
    }
    async save(entity) {
        try {
            return await this.repository.save(entity);
        }
        catch (error) {
            return this.handleError('save', error, { entity });
        }
    }
    async remove(entity) {
        try {
            return await this.repository.remove(entity);
        }
        catch (error) {
            return this.handleError('remove', error, { entity });
        }
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base.repository.js.map