import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSuspensionToUsers1700000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'isSuspended',
        type: 'boolean',
        default: false,
      })
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'suspensionEndDate',
        type: 'timestamp',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'suspensionReason',
        type: 'text',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'suspensionReason');
    await queryRunner.dropColumn('users', 'suspensionEndDate');
    await queryRunner.dropColumn('users', 'isSuspended');
  }
}