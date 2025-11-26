#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script para visualizar logs do MestreDB Backend

.DESCRIPTION
    Facilita a visualização de logs no Windows

.PARAMETER Type
    Tipo de log: combined, error, http, all

.PARAMETER Tail
    Número de linhas para exibir (padrão: 20)

.PARAMETER Follow
    Seguir logs em tempo real (como tail -f)

.EXAMPLE
    .\scripts\view-logs.ps1 -Type combined
    .\scripts\view-logs.ps1 -Type error -Tail 10
    .\scripts\view-logs.ps1 -Type http -Follow
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("combined", "error", "http", "all")]
    [string]$Type = "combined",

    [Parameter(Mandatory=$false)]
    [int]$Tail = 20,

    [Parameter(Mandatory=$false)]
    [switch]$Follow
)

$today = Get-Date -Format "yyyy-MM-dd"
$logsPath = "logs"

# Verifica se pasta logs existe
if (-not (Test-Path $logsPath)) {
    Write-Host "❌ Pasta 'logs' não encontrada!" -ForegroundColor Red
    Write-Host "💡 Execute 'npm run dev' primeiro para gerar os logs." -ForegroundColor Yellow
    exit 1
}

# Lista arquivos de log
Write-Host "`n📂 Arquivos de log disponíveis:" -ForegroundColor Cyan
Get-ChildItem $logsPath\*.log | ForEach-Object {
    $size = [math]::Round($_.Length/1KB, 2)
    Write-Host "   📄 $($_.Name) - ${size}KB" -ForegroundColor Gray
}

Write-Host ""

# Determina qual arquivo ler
$logFile = switch ($Type) {
    "combined" { "$logsPath\combined-$today.log" }
    "error"    { "$logsPath\error-$today.log" }
    "http"     { "$logsPath\http-$today.log" }
    "all"      { "$logsPath\*.log" }
}

# Verifica se arquivo existe
if ($Type -ne "all" -and -not (Test-Path $logFile)) {
    Write-Host "❌ Arquivo de log não encontrado: $logFile" -ForegroundColor Red
    Write-Host "💡 Execute 'npm run dev' para gerar logs de hoje." -ForegroundColor Yellow
    exit 1
}

# Exibe logs
if ($Type -eq "all") {
    Write-Host "📋 Exibindo TODOS os logs (últimas $Tail linhas):" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Get-ChildItem $logsPath\*.log | ForEach-Object {
        Write-Host "`n📄 $($_.Name):" -ForegroundColor Cyan
        Get-Content $_.FullName -Tail $Tail
    }
} else {
    $emoji = switch ($Type) {
        "combined" { "📋" }
        "error"    { "❌" }
        "http"     { "🌐" }
    }

    if ($Follow) {
        Write-Host "$emoji Seguindo logs de $Type em tempo real (Ctrl+C para sair):" -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Get-Content $logFile -Wait -Tail $Tail
    } else {
        Write-Host "$emoji Exibindo últimas $Tail linhas de $Type logs:" -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Get-Content $logFile -Tail $Tail
    }
}

Write-Host "`n✅ Concluído!" -ForegroundColor Green
