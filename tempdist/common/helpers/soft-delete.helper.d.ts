import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
export declare class SoftDeleteHelper {
    static excludeDeleted<T extends ObjectLiteral>(query: SelectQueryBuilder<T>, alias?: string): SelectQueryBuilder<T>;
    static onlyDeleted<T extends ObjectLiteral>(query: SelectQueryBuilder<T>, alias?: string): SelectQueryBuilder<T>;
    static withDeleted<T extends ObjectLiteral>(query: SelectQueryBuilder<T>): SelectQueryBuilder<T>;
    static restore<T extends ObjectLiteral>(query: SelectQueryBuilder<T>, alias?: string): Promise<any>;
}
