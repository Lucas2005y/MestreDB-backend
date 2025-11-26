import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration: Criar tabela users
 *
 * Esta é a migration inicial que cria a tabela de usuários do sistema.
 * Inclui todos os campos necessários para autenticação e gerenciamento de usuários.
 *
 * Campos:
 * - id: Identificador único (BIGINT AUTO_INCREMENT)
 * - name: Nome do usuário (VARCHAR 80)
 * - email: Email único (VARCHAR 254)
 * - password: Senha hash bcrypt (VARCHAR 128)
 * - is_superuser: Flag de superusuário (BOOLEAN)
 * - last_login: Data do último login (DATETIME nullable)
 * - last_access: Data do último acesso (DATETIME)
 * - created_at: Data de criação (DATETIME)
 * - updated_at: Data de atualização (DATETIME)
 *
 * Índices:
 * - PRIMARY KEY em id
 * - UNIQUE INDEX em email
 * - INDEX em is_superuser (para queries de admin)
 *
 * @author Kiro AI
 * @date 2024-11-26
 */
export class CreateUsersTable1732636800000 implements MigrationInterface {
  name = 'CreateUsersTable1732636800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela users
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            comment: 'Identificador único do usuário',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '80',
            isNullable: false,
            comment: 'Nome completo do usuário',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '254',
            isNullable: false,
            isUnique: true,
            comment: 'Email único do usuário (usado para login)',
          },
          {
            name: 'password',
            type: 'varchar',
            length: '128',
            isNullable: false,
            comment: 'Hash bcrypt da senha (12 salt rounds)',
          },
          {
            name: 'is_superuser',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Flag indicando se o usuário é superusuário (admin)',
          },
          {
            name: 'last_login',
            type: 'datetime',
            isNullable: true,
            comment: 'Data e hora do último login bem-sucedido',
          },
          {
            name: 'last_access',
            type: 'datetime',
            isNullable: false,
            comment: 'Data e hora do último acesso ao sistema',
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
            comment: 'Data e hora de criação do registro',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
            comment: 'Data e hora da última atualização do registro',
          },
        ],
      }),
      true, // ifNotExists
    );

    // Criar índice adicional em is_superuser para otimizar queries de admin
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_is_superuser',
        columnNames: ['is_superuser'],
      }),
    );

    console.log('✅ Tabela users criada com sucesso');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índice
    await queryRunner.dropIndex('users', 'IDX_users_is_superuser');

    // Remover tabela
    await queryRunner.dropTable('users', true); // ifExists

    console.log('✅ Tabela users removida com sucesso');
  }
}
