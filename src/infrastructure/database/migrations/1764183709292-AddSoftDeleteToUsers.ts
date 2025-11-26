import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm";

export class AddSoftDeleteToUsers1764183709292 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adicionar coluna deleted_at
        await queryRunner.addColumn('users', new TableColumn({
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
            default: null,
        }));

        // Adicionar índice para otimizar queries de soft delete
        await queryRunner.createIndex('users', new TableIndex({
            name: 'IDX_users_deleted_at',
            columnNames: ['deleted_at'],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover índice
        await queryRunner.dropIndex('users', 'IDX_users_deleted_at');

        // Remover coluna
        await queryRunner.dropColumn('users', 'deleted_at');
    }

}
