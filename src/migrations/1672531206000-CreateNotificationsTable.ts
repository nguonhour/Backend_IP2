import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateNotificationsTable1672531206000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('notifications')) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'channel',
            type: 'varchar',
            length: '50',
            default: "'IN_APP'",
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'PENDING'",
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'content',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'reference_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'recipient_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'read_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'sent_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add indexes
    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        columnNames: ['user_id', 'created_at'],
        name: 'IDX_NOTIFICATIONS_USER_CREATED',
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        columnNames: ['user_id', 'status'],
        name: 'IDX_NOTIFICATIONS_USER_STATUS',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('notifications')) {
      await queryRunner.dropTable('notifications');
    }
  }
}
