import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserSuspensionFields1700000002 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'suspendedUntil',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'suspensionReason',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'lastSeen',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'profilePicture',
        type: 'varchar',
        isNullable: true,
      }),
    ]);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.dropColumns('users', [
      'suspendedUntil',
      'suspensionReason',
      'lastSeen',
      'profilePicture',
    ]);

  }

}