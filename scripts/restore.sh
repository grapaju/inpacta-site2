#!/bin/bash

# Script de Restauração de Backup
# Uso: ./restore.sh db_20241218_030000.sql.gz

BACKUP_DIR="/www/backup/inpacta"
PROJECT_DIR="/www/wwwroot/inpacta.org.br"
DB_NAME="inpacta_db"
DB_USER="inpacta_user"
DB_PASSWORD="SUA_SENHA_AQUI"  # Altere para sua senha

# Verificar argumentos
if [ $# -eq 0 ]; then
    echo "❌ Uso: $0 <arquivo_backup>"
    echo "Backups disponíveis:"
    ls -lh "$BACKUP_DIR"/db_*.sql.gz 2>/dev/null || echo "  Nenhum backup encontrado"
    exit 1
fi

BACKUP_FILE="$1"

# Verificar se arquivo existe
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "❌ Arquivo não encontrado: $BACKUP_DIR/$BACKUP_FILE"
    exit 1
fi

# Confirmação
echo "⚠️  ATENÇÃO: Esta operação irá SUBSTITUIR todos os dados do banco atual!"
echo "Banco: $DB_NAME"
echo "Backup: $BACKUP_FILE"
read -p "Deseja continuar? (sim/não): " confirm

if [ "$confirm" != "sim" ]; then
    echo "Operação cancelada."
    exit 0
fi

# Criar backup de segurança antes de restaurar
echo "📦 Criando backup de segurança do estado atual..."
SAFETY_BACKUP="safety_backup_$(date +%Y%m%d_%H%M%S).sql"
PGPASSWORD="$DB_PASSWORD" pg_dump -h localhost -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/$SAFETY_BACKUP"
echo "✅ Backup de segurança salvo: $SAFETY_BACKUP"

# Descompactar se necessário
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "📂 Descompactando backup..."
    gunzip -c "$BACKUP_DIR/$BACKUP_FILE" > "/tmp/restore_temp.sql"
    RESTORE_FILE="/tmp/restore_temp.sql"
else
    RESTORE_FILE="$BACKUP_DIR/$BACKUP_FILE"
fi

# Parar aplicação (se estiver rodando via PM2 ou aaPanel)
echo "⏸️  Parando aplicação..."
cd "$PROJECT_DIR"
pm2 stop inpacta 2>/dev/null || true

# Restaurar banco de dados
echo "🔄 Restaurando banco de dados..."
PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" < "$RESTORE_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Banco de dados restaurado com sucesso!"
else
    echo "❌ Erro ao restaurar banco de dados"
    echo "💡 Você pode restaurar o backup de segurança: $SAFETY_BACKUP"
    exit 1
fi

# Limpar arquivo temporário
if [[ $BACKUP_FILE == *.gz ]]; then
    rm -f "/tmp/restore_temp.sql"
fi

# Reiniciar aplicação
echo "▶️  Reiniciando aplicação..."
pm2 restart inpacta 2>/dev/null || true

echo "========================================="
echo "✅ Restauração concluída!"
echo "📁 Backup de segurança mantido em: $SAFETY_BACKUP"
echo "========================================="
