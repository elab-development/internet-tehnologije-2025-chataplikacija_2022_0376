import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateMessagesAndReports1700000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    // Create messages table
    await queryRunner.createTable(

      new Table({
        name: 'messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'senderId',
            type: 'uuid',
          },
          {
            name: 'chatId',
            type: 'uuid',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['text', 'file', 'gif'],
            default: "'text'",
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'fileUrl',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'fileName',
            type: 'varchar',
            isNullable: true,
          },
         {
            name: 'isEdited',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isDeleted',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );
 
    // Add foreign keys

    await queryRunner.createForeignKey(

      'messages',

      new TableForeignKey({
        columnNames: ['senderId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );
 
    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['chatId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'chats',
        onDelete: 'CASCADE',
      })
    );
 
    // Create chat_memberships table

    await queryRunner.createTable(

      new Table({

        name: 'chat_memberships',

        columns: [

          {

            name: 'id',

            type: 'uuid',

            isPrimary: true,

            generationStrategy: 'uuid',

            default: 'uuid_generate_v4()',

          },

          {

            name: 'userId',

            type: 'uuid',

          },

          {

            name: 'chatId',

            type: 'uuid',

          },

          {

            name: 'role',

            type: 'enum',

            enum: ['member', 'moderator', 'admin'],

            default: "'member'",

          },

          {

            name: 'isMuted',

            type: 'boolean',

            default: false,

          },

          {

            name: 'joinedAt',

            type: 'timestamp',

            default: 'now()',

          },

        ],

      }),

      true

    );

 

    await queryRunner.createForeignKey(

      'chat_memberships',

      new TableForeignKey({

        columnNames: ['userId'],

        referencedColumnNames: ['id'],

        referencedTableName: 'users',

        onDelete: 'CASCADE',

      })

    );

 

    await queryRunner.createForeignKey(

      'chat_memberships',

      new TableForeignKey({

        columnNames: ['chatId'],

        referencedColumnNames: ['id'],

        referencedTableName: 'chats',

        onDelete: 'CASCADE',

      })

    );

 

    // Create message_reports table

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

            name: 'messageId',

            type: 'uuid',

          },

          {

            name: 'reporterId',

            type: 'uuid',

          },

          {

            name: 'reason',

            type: 'enum',

            enum: ['spam', 'harassment', 'hate_speech', 'inappropriate_content', 'other'],

          },

          {

            name: 'additionalComment',

            type: 'text',

            isNullable: true,

          },

          {

            name: 'status',

            type: 'enum',

            enum: ['pending', 'reviewed', 'resolved', 'dismissed'],

            default: "'pending'",

          },

          {

            name: 'reviewedById',

            type: 'uuid',

            isNullable: true,

          },

          {

            name: 'reviewNotes',

            type: 'text',

            isNullable: true,

          },

          {

            name: 'createdAt',

            type: 'timestamp',

            default: 'now()',

          },

          {

            name: 'updatedAt',

            type: 'timestamp',

            default: 'now()',

          },

        ],

      }),

      true

    );

 

    await queryRunner.createForeignKey(

      'message_reports',

      new TableForeignKey({

        columnNames: ['messageId'],

        referencedColumnNames: ['id'],

        referencedTableName: 'messages',

        onDelete: 'CASCADE',

      })

    );

 

    await queryRunner.createForeignKey(

      'message_reports',

      new TableForeignKey({

        columnNames: ['reporterId'],

        referencedColumnNames: ['id'],

        referencedTableName: 'users',

        onDelete: 'CASCADE',

      })

    );

 

    await queryRunner.createForeignKey(
      'message_reports',
      new TableForeignKey({
        columnNames: ['reviewedById'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('message_reports');
    await queryRunner.dropTable('chat_memberships');
    await queryRunner.dropTable('messages');
  }

}