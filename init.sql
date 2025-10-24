-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS mestredb_sql;
USE mestredb_sql;

-- Criação da tabela de usuários baseada na estrutura do Django
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login DATETIME NULL,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    is_superuser BOOLEAN DEFAULT FALSE,
    last_access DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índices para otimização
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email);
CREATE INDEX IF NOT EXISTS users_is_superuser_idx ON users(is_superuser);
CREATE INDEX IF NOT EXISTS users_last_access_idx ON users(last_access);

-- Inserção de usuário administrador padrão (senha: admin123)
INSERT IGNORE INTO users (name, email, password, is_superuser) VALUES 
('Administrador', 'admin@mestredb.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9u2', TRUE);