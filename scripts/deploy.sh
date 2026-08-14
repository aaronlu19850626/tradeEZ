#!/usr/bin/env bash
# TradeEZ 发版：本地构建前端 → 上传 → 服务器重建 API → 执行迁移
set -euo pipefail

HOST="${DEPLOY_HOST:-tradeez-server}"
REMOTE_DIR="${DEPLOY_DIR:-/opt/tradeez}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

step() { printf '\n\033[1;34m▸ %s\033[0m\n' "$1"; }

cd "$ROOT"

step '本地校验'
pnpm -r typecheck
pnpm -r test

step '构建前端'
pnpm --filter @tradeez/shared build
pnpm --filter @tradeez/web build

step "上传前端产物到 $HOST:$REMOTE_DIR/web"
ssh "$HOST" "mkdir -p $REMOTE_DIR/web"
# --delete 清理已删除的旧 chunk，避免产物目录无限膨胀
rsync -az --delete apps/web/dist/ "$HOST:$REMOTE_DIR/web/"

step '上传编排与源码'
rsync -az --delete \
  --exclude node_modules --exclude dist --exclude .env \
  deploy/ "$HOST:$REMOTE_DIR/deploy/"
rsync -az --delete --exclude node_modules --exclude dist \
  apps/api packages "$HOST:$REMOTE_DIR/src-tmp/"
ssh "$HOST" "cd $REMOTE_DIR && rsync -a src-tmp/ . && rm -rf src-tmp"
rsync -az package.json pnpm-lock.yaml pnpm-workspace.yaml "$HOST:$REMOTE_DIR/"

step '重建并重启 API'
ssh "$HOST" "cd $REMOTE_DIR/deploy && docker compose up -d --build api caddy"

step '执行数据库迁移'
ssh "$HOST" "cd $REMOTE_DIR/deploy && docker compose exec -T api pnpm db:migrate"

step '健康检查'
sleep 5
ssh "$HOST" "curl -fsS http://127.0.0.1:8080/api/health 2>/dev/null || cd $REMOTE_DIR/deploy && docker compose exec -T api node -e \"fetch('http://127.0.0.1:3000/api/health').then(r=>r.json()).then(j=>console.log(JSON.stringify(j)))\""

printf '\n\033[1;32m✓ 发版完成\033[0m\n'
