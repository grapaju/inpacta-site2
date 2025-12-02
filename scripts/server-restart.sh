#!/usr/bin/env bash
set -euo pipefail

# Caminho do projeto é o diretório atual (WORK_DIR do workflow)
# Modo de restart: matar processo existente e iniciar novamente em background.

echo "[restart] Parando processos antigos do Next..."
pkill -f "next start" || true
sleep 1

echo "[restart] Subindo aplicação em background..."
nohup npm run start >/dev/null 2>&1 &

echo "[restart] Feito. Verifique logs via aaPanel/Nginx se necessário."
