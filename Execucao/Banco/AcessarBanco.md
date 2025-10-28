# Conectar ao container MySQL
docker exec -it mestredb_mysql mysql -u root -proot

# Usar o banco
USE mestredb_sql;

# Ver todas as tabelas
SHOW TABLES;

# Ver todos os usuários
SELECT * FROM users;