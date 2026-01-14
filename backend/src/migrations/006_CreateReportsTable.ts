import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateReportsTable1700000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'message_reports',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'reason',
            type: 'enum',
            enum: ['spam', 'harassment', 'hate_speech', 'inappropriate_content', 'violence', 'other'],
            default: "'other'",
          },
          {
            name: 'comment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
            default: "'pending'",
          },
          {
            name: 'messageId',
            type: 'uuid',
          },
          {
            name: 'reporterId',
            type: 'uuid',
          },
          {
            name: 'reviewerId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reviewComment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'reviewedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKeys('message_reports', [
      new TableForeignKey({
        columnNames: ['messageId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'messages',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['reporterId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['reviewerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('message_reports');
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('message_reports', foreignKey);
      }
    }
    await queryRunner.dropTable('message_reports');
  }
}