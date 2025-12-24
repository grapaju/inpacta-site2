#!/bin/bash

# Script de Backup Automático para aaPanel
# Coloque em: /www/wwwroot/inpacta.org.br/scripts/backup.sh
# Torne executável: chmod +x scripts/backup.sh
# Agende no crontab: 0 3 * * * /www/wwwroot/inpacta.org.br/scripts/backup.sh

# Configurações
PROJECT_DIR="/www/wwwroot/inpacta.org.br"
BACKUP_DIR="/www/backup/inpacta"
DB_NAME="inpacta_db"
DB_USER="inpacta_user"
DB_PASSWORD="SUA_SENHA_AQUI"  # Altere para sua senha
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=30

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Função para log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$BACKUP_DIR/backup.log"
}

log "========================================="
log "Iniciando backup..."

# 1. Backup do Banco de Dados PostgreSQL
log "Backup do banco de dados..."
PGPASSWORD="$DB_PASSWORD" pg_dump -h localhost -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/db_$DATE.sql"

if [ $? -eq 0 ]; then
    log "✅ Backup do banco concluído: db_$DATE.sql"
    # Comprimir
    gzip "$BACKUP_DIR/db_$DATE.sql"
    log "✅ Compactado: db_$DATE.sql.gz"
else
    log "❌ Erro no backup do banco de dados"
fi

# 2. Backup de Uploads (imagens, arquivos)
log "Backup de uploads..."
if [ -d "$PROJECT_DIR/public/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C "$PROJECT_DIR/public" uploads/
    if [ $? -eq 0 ]; then
        log "✅ Backup de uploads concluído: uploads_$DATE.tar.gz"
    else
        log "❌ Erro no backup de uploads"
    fi
else
    log "⚠️  Diretório de uploads não encontrado"
fi

# 3. Backup do arquivo .env.production (se existir)
log "Backup de configurações..."
if [ -f "$PROJECT_DIR/.env.production" ]; then
    cp "$PROJECT_DIR/.env.production" "$BACKUP_DIR/env_$DATE.backup"
    log "✅ Backup de .env.production concluído"
fi

# 4. Limpar backups antigos (manter últimos X dias)
log "Limpando backups antigos (manter últimos $KEEP_DAYS dias)..."
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +$KEEP_DAYS -delete
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +$KEEP_DAYS -delete
find "$BACKUP_DIR" -name "env_*.backup" -mtime +$KEEP_DAYS -delete
log "✅ Limpeza concluída"

# 5. Calcular tamanho total dos backups
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "📦 Espaço usado por backups: $TOTAL_SIZE"

# 6. Verificar integridade do último backup
log "Verificando integridade do backup..."
if [ -f "$BACKUP_DIR/db_$DATE.sql.gz" ]; then
    gunzip -t "$BACKUP_DIR/db_$DATE.sql.gz"
    if [ $? -eq 0 ]; then
        log "✅ Backup íntegro"
    else
        log "❌ Backup corrompido!"
    fi
fi

log "Backup finalizado"
log "========================================="

# Enviar notificação (opcional - requer configuração de email)
# echo "Backup concluído em $(date)" | mail -s "Backup INPACTA - $DATE" admin@inpacta.org.br
