# 📊 Visualizando Logs no Windows

Guia rápido para visualizar logs do MestreDB Backend no Windows.

---

## 🚀 Comandos Rápidos (npm)

### Ver logs combinados (últimas 20 linhas)
```bash
npm run logs
```

### Ver apenas erros
```bash
npm run logs:error
```

### Ver requisições HTTP
```bash
npm run logs:http
```

### Ver em tempo real (como tail -f)
```bash
npm run logs:follow
```

### Ver todos os logs
```bash
npm run logs:all
```

---

## 💻 Comandos PowerShell

### Listar arquivos de log
```powershell
# Simples
Get-ChildItem logs

# Com detalhes
Get-ChildItem logs | Format-Table Name, Length, LastWriteTime

# Apenas .log
Get-ChildItem logs\*.log
```

### Ver conteúdo
```powershell
# Ver arquivo completo
Get-Content logs\combined-2025-01-18.log

# Últimas 20 linhas
Get-Content logs\combined-2025-01-18.log -Tail 20

# Primeiras 10 linhas
Get-Content logs\combined-2025-01-18.log -Head 10
```

### Ver em tempo real
```powershell
# Logs combinados
Get-Content logs\combined-2025-01-18.log -Wait -Tail 20

# Apenas erros
Get-Content logs\error-2025-01-18.log -Wait -Tail 10

# Requisições HTTP
Get-Content logs\http-2025-01-18.log -Wait -Tail 15
```

### Buscar nos logs
```powershell
# Buscar palavra "error"
Select-String -Path logs\*.log -Pattern "error"

# Buscar por usuário
Select-String -Path logs\*.log -Pattern "userId.*1"

# Buscar com contexto (2 linhas antes e depois)
Select-String -Path logs\*.log -Pattern "error" -Context 2,2
```

### Análise
```powershell
# Contar erros
(Select-String -Path logs\error-*.log -Pattern "error").Count

# Ver tamanho dos logs
Get-ChildItem logs\*.log | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}}

# Logs de hoje
Get-ChildItem logs\*-$(Get-Date -Format yyyy-MM-dd).log
```

---

## 🖥️ Comandos CMD (Prompt de Comando)

### Listar arquivos
```cmd
dir logs
```

### Ver conteúdo
```cmd
type logs\combined-2025-01-18.log
```

### Ver últimas linhas (usa PowerShell)
```cmd
powershell Get-Content logs\combined-2025-01-18.log -Tail 20
```

---

## 📁 Explorador de Arquivos

1. Abra a pasta do projeto
2. Entre na pasta `logs`
3. Duplo clique no arquivo `.log`
4. Abre no Notepad

---

## 🎨 VS Code (Recomendado!)

1. Abra o VS Code na pasta do projeto
2. No Explorer lateral, clique em `logs`
3. Clique no arquivo `.log`
4. Logs aparecem formatados!

**Dica:** Instale a extensão "Log File Highlighter" para colorir os logs.

---

## 🔧 Criar Aliases (Opcional)

Adicione no seu perfil do PowerShell para comandos mais curtos:

```powershell
# Abrir perfil
notepad $PROFILE

# Adicionar:
function ll { Get-ChildItem $args | Format-Table }
function cat { Get-Content $args }
function tail { Get-Content $args -Tail 20 }
function tailf { Get-Content $args -Wait -Tail 20 }
function grep { Select-String $args }

# Salvar e recarregar
. $PROFILE
```

Agora você pode usar:
```powershell
ll logs                    # Lista arquivos
cat logs\file.log          # Ver conteúdo
tail logs\file.log         # Últimas 20 linhas
tailf logs\file.log        # Tempo real
grep "error" logs\*.log    # Buscar
```

---

## 📊 Estrutura dos Logs

```
logs/
├── combined-2025-01-18.log      # Todos os logs
├── error-2025-01-18.log         # Apenas erros
├── http-2025-01-18.log          # Apenas HTTP
├── combined-2025-01-17.log.gz   # Compactado (dia anterior)
└── .audit.json                  # Metadados (ignorar)
```

---

## 🎯 Exemplos Práticos

### Monitorar logs enquanto desenvolve

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
npm run logs:follow
```

Agora você vê os logs em tempo real enquanto desenvolve!

---

### Debugar erro específico

```powershell
# Buscar erro
Select-String -Path logs\error-*.log -Pattern "ValidationError"

# Ver contexto (5 linhas antes e depois)
Select-String -Path logs\error-*.log -Pattern "ValidationError" -Context 5,5
```

---

### Ver performance de requisições

```powershell
# Ver requisições HTTP
Get-Content logs\http-2025-01-18.log -Tail 50

# Buscar requisições lentas (> 1000ms)
Select-String -Path logs\http-*.log -Pattern "responseTime.*[1-9]\d{3,}ms"
```

---

## 🛠️ Ferramentas Visuais (Opcional)

### Baretail (Grátis)
- Download: https://www.baremetalsoft.com/baretail/
- Atualiza em tempo real
- Busca e filtros
- Destaque de cores

### Log Expert (Grátis)
- Download: https://github.com/zarunbal/LogExpert
- Interface gráfica
- Filtros avançados

### mTail (Grátis)
- Download: http://ophilipp.free.fr/op_tail.htm
- Simples e leve

---

## ❓ Troubleshooting

### "Pasta logs não encontrada"
**Solução:** Execute `npm run dev` primeiro para gerar os logs.

### "Arquivo não encontrado"
**Solução:** Os logs são criados com a data de hoje. Verifique a data no nome do arquivo.

### "Comando não reconhecido"
**Solução:** Use PowerShell, não CMD. Ou use `npm run logs`.

### "Permissão negada"
**Solução:** Execute PowerShell como Administrador ou use VS Code.

---

## 📚 Documentação Completa

Para mais detalhes sobre o sistema de logs:
- [Implementação de Logs Estruturados](../09-roadmap/IMPLEMENTATION_STRUCTURED_LOGS.md)

---

**Última atualização:** 2025-01-18
**Sistema:** Windows
