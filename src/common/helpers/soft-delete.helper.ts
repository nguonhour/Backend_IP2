import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';

/**
 * Helper utilities for soft delete queries
 */
export class SoftDeleteHelper {
  /**
   * Exclude soft deleted records from query
   */
  static excludeDeleted<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    alias: string = query.alias,
  ): SelectQueryBuilder<T> {
    return query.andWhere(`${alias}.deletedAt IS NULL`);
  }

  /**
   * Include only soft deleted records
   */
  static onlyDeleted<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    alias: string = query.alias,
  ): SelectQueryBuilder<T> {
    return query.andWhere(`${alias}.deletedAt IS NOT NULL`);
  }

  /**
   * Include all records (deleted and active)
   */
  static withDeleted<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
  ): SelectQueryBuilder<T> {
    return query.withDeleted();
  }

  /**
   * Restore soft deleted record
   */
  static async restore<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    alias: string = query.alias,
  ): Promise<any> {
    return query
      .update()
      .set({ [alias + '.deletedAt']: null } as any)
      .execute();
  }
}
