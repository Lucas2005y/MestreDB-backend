# Configurações de Aplicações Externas - MestreDB Backend

## 📋 Visão Geral

Este documento fornece instruções detalhadas para configuração de todas as aplicações externas necessárias para o funcionamento do MestreDB Backend, incluindo Docker, MySQL, phpMyAdmin e outras dependências externas.

## 🐳 Configuração do Docker

### Pré-requisitos do Docker

#### Instalação do Docker

**Windows:**
1. Baixar Docker Desktop: https://www.docker.com/products/docker-desktop
2. Habilitar WSL2 (Windows Subsystem for Linux 2)
3. Reiniciar o sistema após instalação

**macOS:**
1. Baixar Docker Desktop para Mac
2. Instalar seguindo o assistente
3. Verificar se Docker está rodando na barra de menu

**Linux (Ubuntu/Debian):**
```bash
# Atualizar repositórios
sudo apt update

# Instalar dependências
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release

# Adicionar chave GPG oficial do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Reiniciar sessão ou executar
newgrp docker
```

#### Verificação da Instalação

```bash
# Verificar versão do Docker
docker --version

# Verificar versão do Docker Compose
docker-compose --version

# Testar instalação
docker run hello-world
```

### Configuração do Docker Compose

#### Arquivo docker-compose.yml

O projeto inclui um arquivo `docker-compose.yml` completo:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: mestredb_mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: mestredb_sql
      MYSQL_USER: mestredb_user
      MYSQL_PASSWORD: mestredb_pass
    ports:
      - "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    command: --default-authentication-plugin=mysql_native_password
    networks:
      - mestredb_network

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: mestredb_phpmyadmin
    restart: always
    environment:
      PMA_HOST: mysql
      PMA_PORT: 3306
      PMA_USER: root
      PMA_PASSWORD: root
    ports:
      - "8080:80"
    depends_on:
      - mysql
    networks:
      - mestredb_network

volumes:
  mysql_data:

networks:
  mestredb_network:
    driver: bridge
```

#### Comandos Docker Essenciais

```bash
# Iniciar todos os serviços
npm run docker:up
# ou
docker-compose up -d

# Parar todos os serviços
npm run docker:down
# ou
docker-compose down

# Ver logs dos serviços
npm run docker:logs
# ou
docker-compose logs -f

# Ver status dos containers
docker ps

# Reiniciar um serviço específico
docker-compose restart mysql

# Reconstruir containers
docker-compose up -d --build

# Remover volumes (CUIDADO: apaga dados)
docker-compose down -v
```

## 🗄️ Configuração do MySQL

### Configuração via Docker (Recomendado)

#### Variáveis de Ambiente do MySQL

```yaml
environment:
  MYSQL_ROOT_PASSWORD: root          # Senha do usuário root
  MYSQL_DATABASE: mestredb_sql       # Nome do banco padrão
  MYSQL_USER: mestredb_user          # Usuário adicional
  MYSQL_PASSWORD: mestredb_pass      # Senha do usuário adicional
```

#### Portas e Volumes

```yaml
ports:
  - "3307:3306"  # Porta externa:interna (evita conflito com MySQL local)

volumes:
  - mysql_data:/var/lib/mysql                           # Persistência de dados
  - ./init.sql:/docker-entrypoint-initdb.d/init.sql    # Script de inicialização
```

#### Script de Inicialização (init.sql)

```sql
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
```

### Configuração MySQL Local (Alternativa)

#### Instalação do MySQL

**Windows:**
1. Baixar MySQL Installer: https://dev.mysql.com/downloads/installer/
2. Escolher "Developer Default" ou "Server only"
3. Configurar senha root durante instalação

**macOS:**
```bash
# Usando Homebrew
brew install mysql

# Iniciar MySQL
brew services start mysql

# Configurar senha root
mysql_secure_installation
```

**Linux (Ubuntu/Debian):**
```bash
# Instalar MySQL Server
sudo apt update
sudo apt install mysql-server

# Configurar instalação
sudo mysql_secure_installation

# Iniciar serviço
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### Configuração Manual do Banco

```sql
-- Conectar como root
mysql -u root -p

-- Criar banco de dados
CREATE DATABASE mestredb_sql;

-- Criar usuário específico
CREATE USER 'mestredb_user'@'localhost' IDENTIFIED BY 'mestredb_pass';

-- Conceder privilégios
GRANT ALL PRIVILEGES ON mestredb_sql.* TO 'mestredb_user'@'localhost';
FLUSH PRIVILEGES;

-- Usar banco criado
USE mestredb_sql;

-- Executar script de inicialização (copiar conteúdo do init.sql)
```

## 🌐 Configuração do phpMyAdmin

### Acesso via Docker

O phpMyAdmin é automaticamente configurado via Docker Compose:

**URL de Acesso:** http://localhost:8080

**Credenciais:**
- **Servidor:** mysql (nome do container)
- **Usuário:** root
- **Senha:** root

### Configuração Manual (Opcional)

#### Instalação Local

**Windows/macOS:**
1. Baixar phpMyAdmin: https://www.phpmyadmin.net/downloads/
2. Extrair em servidor web (XAMPP, WAMP, MAMP)
3. Configurar config.inc.php

**Linux:**
```bash
# Instalar phpMyAdmin
sudo apt install phpmyadmin

# Configurar servidor web (Apache/Nginx)
sudo ln -s /usr/share/phpmyadmin /var/www/html/phpmyadmin
```

#### Arquivo de Configuração (config.inc.php)

```php
<?php
$cfg['Servers'][1]['auth_type'] = 'cookie';
$cfg['Servers'][1]['host'] = 'localhost';
$cfg['Servers'][1]['port'] = '3307';  // Porta do Docker
$cfg['Servers'][1]['connect_type'] = 'tcp';
$cfg['Servers'][1]['compress'] = false;
$cfg['Servers'][1]['AllowNoPassword'] = false;

$cfg['blowfish_secret'] = 'sua_chave_secreta_aqui';
?>
```

## ⚙️ Configuração de Variáveis de Ambiente

### Arquivo .env Completo

```env
# ===========================================
# CONFIGURAÇÕES DO SERVIDOR
# ===========================================
PORT=3000
NODE_ENV=development

# ===========================================
# CONFIGURAÇÕES DO BANCO DE DADOS
# ===========================================

# MongoDB (mantido para compatibilidade futura)
MONGODB_URI=mongodb://localhost:27017/mestredb
DATABASE_NAME=mestredb

# MySQL - Configuração principal
MYSQL_HOST=localhost
MYSQL_PORT=3307                    # Porta do Docker (3306 para MySQL local)
MYSQL_USERNAME=root
MYSQL_PASSWORD=root                # Alterar em produção
MYSQL_DATABASE=mestredb_sql

# ===========================================
# CONFIGURAÇÕES DE AUTENTICAÇÃO JWT
# ===========================================
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_com_pelo_menos_32_caracteres
JWT_ACCESS_EXPIRES_IN=15m          # Token de acesso (15 minutos)
JWT_REFRESH_EXPIRES_IN=7d          # Token de refresh (7 dias)

# ===========================================
# CONFIGURAÇÕES DE CORS
# ===========================================
CORS_ORIGIN=http://localhost:3000  # URL do frontend

# ===========================================
# USUÁRIO ADMINISTRADOR PADRÃO
# ===========================================
ADMIN_EMAIL=admin@mestredb.com
ADMIN_PASSWORD=admin123            # Alterar em produção

# ===========================================
# CONFIGURAÇÕES DE RATE LIMITING
# ===========================================
RATE_LIMIT_MAX_ATTEMPTS=5          # Máximo de tentativas
RATE_LIMIT_WINDOW_MINUTES=15       # Janela de tempo (minutos)
RATE_LIMIT_BLOCK_MINUTES=15        # Tempo de bloqueio (minutos)

# ===========================================
# CONFIGURAÇÕES DE LOGGING
# ===========================================
LOG_LEVEL=info                     # debug, info, warn, error
LOG_FILE=logs/app.log              # Arquivo de log (opcional)

# ===========================================
# CONFIGURAÇÕES DE PRODUÇÃO (OPCIONAL)
# ===========================================
# SSL_CERT_PATH=/path/to/cert.pem
# SSL_KEY_PATH=/path/to/key.pem
# REDIS_URL=redis://localhost:6379
```

### Configurações por Ambiente

#### Desenvolvimento (.env.development)

```env
NODE_ENV=development
PORT=3000
MYSQL_HOST=localhost
MYSQL_PORT=3307
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
```

#### Teste (.env.test)

```env
NODE_ENV=test
PORT=3001
MYSQL_HOST=localhost
MYSQL_PORT=3308
MYSQL_DATABASE=mestredb_sql_test
LOG_LEVEL=error
```

#### Produção (.env.production)

```env
NODE_ENV=production
PORT=80
MYSQL_HOST=mysql-server.example.com
MYSQL_PORT=3306
JWT_SECRET=chave_super_segura_de_producao_com_64_caracteres_ou_mais
ADMIN_PASSWORD=senha_super_segura_de_producao
LOG_LEVEL=warn
CORS_ORIGIN=https://mestredb.com
```

## 🔧 Ferramentas de Desenvolvimento

### MySQL Workbench

**Instalação:**
- Download: https://dev.mysql.com/downloads/workbench/

**Configuração de Conexão:**
- **Connection Name:** MestreDB Local
- **Hostname:** localhost
- **Port:** 3307 (Docker) ou 3306 (local)
- **Username:** root
- **Password:** root

### DBeaver (Alternativa Gratuita)

**Instalação:**
- Download: https://dbeaver.io/download/

**Configuração:**
1. New Database Connection → MySQL
2. Host: localhost
3. Port: 3307
4. Database: mestredb_sql
5. Username: root
6. Password: root

### Postman/Insomnia (Testes de API)

#### Collection Postman Exemplo

```json
{
  "info": {
    "name": "MestreDB API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/health",
          "host": ["{{baseUrl}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@mestredb.com\",\n  \"password\": \"admin123\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/login",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "login"]
        }
      }
    }
  ]
}
```

## 🚨 Troubleshooting

### Problemas Comuns do Docker

#### Erro: "Port already in use"

**Problema:** Porta 3307 ou 8080 já está em uso

**Soluções:**
```bash
# Verificar processos usando as portas
# Windows:
netstat -ano | findstr :3307
netstat -ano | findstr :8080

# macOS/Linux:
lsof -i :3307
lsof -i :8080

# Alterar portas no docker-compose.yml
ports:
  - "3308:3306"  # MySQL
  - "8081:80"    # phpMyAdmin
```

#### Erro: "Cannot connect to Docker daemon"

**Problema:** Docker não está rodando

**Soluções:**
```bash
# Windows/macOS: Iniciar Docker Desktop

# Linux:
sudo systemctl start docker
sudo systemctl enable docker

# Verificar status
docker info
```

#### Erro: "Volume mount failed"

**Problema:** Permissões de arquivo no Linux

**Soluções:**
```bash
# Dar permissões ao diretório
sudo chown -R $USER:$USER .

# Ou executar Docker com sudo (não recomendado)
sudo docker-compose up -d
```

### Problemas do MySQL

#### Erro: "Access denied for user"

**Problema:** Credenciais incorretas

**Soluções:**
1. **Verificar variáveis no .env**
2. **Resetar container:**
```bash
docker-compose down -v
docker-compose up -d
```

3. **Conectar diretamente ao container:**
```bash
docker exec -it mestredb_mysql mysql -u root -p
```

#### Erro: "Can't connect to MySQL server"

**Problema:** MySQL não está rodando ou porta incorreta

**Soluções:**
```bash
# Verificar se container está rodando
docker ps | grep mysql

# Verificar logs do MySQL
docker logs mestredb_mysql

# Reiniciar container
docker-compose restart mysql
```

#### Erro: "Table doesn't exist"

**Problema:** Script de inicialização não executou

**Soluções:**
```bash
# Recriar container com volume limpo
docker-compose down -v
docker-compose up -d

# Ou executar script manualmente
docker exec -i mestredb_mysql mysql -u root -proot mestredb_sql < init.sql
```

### Problemas de Conectividade

#### Erro: "ECONNREFUSED"

**Problema:** Aplicação não consegue conectar ao banco

**Verificações:**
1. **Container MySQL rodando:** `docker ps`
2. **Porta correta no .env:** `MYSQL_PORT=3307`
3. **Host correto:** `MYSQL_HOST=localhost`
4. **Credenciais corretas**

#### Erro: "CORS policy"

**Problema:** Frontend bloqueado por CORS

**Soluções:**
1. **Verificar CORS_ORIGIN no .env**
2. **Adicionar múltiplas origens:**
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,https://mestredb.com
```

### Problemas de Performance

#### MySQL Lento

**Otimizações:**
```sql
-- Verificar índices
SHOW INDEX FROM users;

-- Analisar queries lentas
SHOW PROCESSLIST;

-- Configurar MySQL (my.cnf)
[mysqld]
innodb_buffer_pool_size = 1G
query_cache_size = 256M
max_connections = 200
```

#### Docker Lento

**Otimizações:**
1. **Aumentar recursos do Docker Desktop**
2. **Usar volumes nomeados em vez de bind mounts**
3. **Limpar containers não utilizados:**
```bash
docker system prune -a
```

## 📊 Monitoramento e Logs

### Logs do Docker

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f mysql

# Ver logs com timestamp
docker-compose logs -f -t

# Limitar número de linhas
docker-compose logs --tail=100 mysql
```

### Logs do MySQL

```bash
# Logs de erro do MySQL
docker exec mestredb_mysql tail -f /var/log/mysql/error.log

# Logs de queries lentas
docker exec mestredb_mysql tail -f /var/log/mysql/slow.log

# Logs gerais
docker exec mestredb_mysql tail -f /var/log/mysql/general.log
```

### Monitoramento de Recursos

```bash
# Uso de recursos dos containers
docker stats

# Informações detalhadas de um container
docker inspect mestredb_mysql

# Espaço usado pelos volumes
docker system df
```

## 🔒 Configurações de Segurança

### Segurança do MySQL

```sql
-- Remover usuários anônimos
DELETE FROM mysql.user WHERE User='';

-- Remover banco de teste
DROP DATABASE IF EXISTS test;

-- Atualizar privilégios
FLUSH PRIVILEGES;

-- Configurar SSL (produção)
-- Adicionar certificados SSL ao container
```

### Segurança do Docker

```yaml
# docker-compose.yml com configurações de segurança
services:
  mysql:
    # ... outras configurações
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/run/mysqld
    volumes:
      - mysql_data:/var/lib/mysql:rw
```

### Backup e Restore

#### Backup Automático

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker exec mestredb_mysql mysqldump -u root -proot mestredb_sql > backup_$DATE.sql
```

#### Restore

```bash
# Restaurar backup
docker exec -i mestredb_mysql mysql -u root -proot mestredb_sql < backup_20240115_103000.sql
```

## 🚀 Deploy em Produção

### Configurações de Produção

#### docker-compose.prod.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: mestredb_mysql_prod
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_prod_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
      - ./mysql-conf:/etc/mysql/conf.d
    command: --default-authentication-plugin=mysql_native_password
    networks:
      - mestredb_prod_network
    security_opt:
      - no-new-privileges:true

volumes:
  mysql_prod_data:
    driver: local

networks:
  mestredb_prod_network:
    driver: bridge
```

#### Comandos de Deploy

```bash
# Deploy em produção
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## ✅ Checklist de Configuração

### Desenvolvimento

- [ ] Docker Desktop instalado e rodando
- [ ] docker-compose.yml configurado
- [ ] Arquivo .env criado e configurado
- [ ] MySQL container rodando (porta 3307)
- [ ] phpMyAdmin acessível (http://localhost:8080)
- [ ] Banco de dados inicializado com script
- [ ] Usuário admin criado
- [ ] Conexão da aplicação funcionando

### Produção

- [ ] Senhas alteradas para valores seguros
- [ ] SSL configurado
- [ ] Backup automático configurado
- [ ] Monitoramento implementado
- [ ] Logs configurados
- [ ] Firewall configurado
- [ ] Volumes persistentes configurados
- [ ] Restart policies definidas

**🎉 Configuração Completa!** Todas as aplicações externas estão configuradas e prontas para uso com o MestreDB Backend.