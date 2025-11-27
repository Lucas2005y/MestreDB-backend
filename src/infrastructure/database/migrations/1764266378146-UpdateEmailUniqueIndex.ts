import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEmailUniqueIndex1764266378146 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remover TODOS os índices únicos do email

        // 1. Índice da entidade TypeORM (users_email_unique)
        await queryRunner.query(`DROP INDEX \`users_email_unique\` ON \`users\``);

        // 2. Índice gerado automaticamente (se existir)
        const indexExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE table_schema = DATABASE()
            AND table_name = 'users'
            AND index_name = 'IDX_97672ac88f789774dd47f7c8be'
        `);

        if (indexExists[0].count > 0) {
            await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        }

        // MySQL 8.0.13+ suporta índices funcionais
        // Criar índice único apenas para emails não deletados (deleted_at IS NULL)
        // Isso permite que o mesmo email seja reutilizado após soft delete
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_users_email_not_deleted\`
            ON \`users\` (\`email\`, (CASE WHEN \`deleted_at\` IS NULL THEN 1 ELSE NULL END))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover o novo índice
        await queryRunner.query(`DROP INDEX \`IDX_users_email_not_deleted\` ON \`users\``);

        // Recriar o índice único original da entidade
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`users_email_unique\`
            ON \`users\` (\`email\`)
        `);
    }

}
