"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoftDeleteHelper = void 0;
class SoftDeleteHelper {
    static excludeDeleted(query, alias = query.alias) {
        return query.andWhere(`${alias}.deletedAt IS NULL`);
    }
    static onlyDeleted(query, alias = query.alias) {
        return query.andWhere(`${alias}.deletedAt IS NOT NULL`);
    }
    static withDeleted(query) {
        return query.withDeleted();
    }
    static async restore(query, alias = query.alias) {
        return query
            .update()
            .set({ [alias + '.deletedAt']: null })
            .execute();
    }
}
exports.SoftDeleteHelper = SoftDeleteHelper;
//# sourceMappingURL=soft-delete.helper.js.map