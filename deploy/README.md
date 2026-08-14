# 部署

单机 Docker Compose：Caddy 托管前端静态文件并反代 API，Postgres 与 Redis 只绑回环。

```
Caddy (80/443, 自动 HTTPS)
├── /          → /srv/web 静态文件（SPA 回退 index.html）
└── /api/*     → api:3000
                  ├── postgres:5432  （仅 127.0.0.1 暴露）
                  └── redis:6379     （仅 127.0.0.1 暴露）
```

## 首次部署

```bash
# 服务器上
sudo mkdir -p /opt/tradeez && sudo chown deploy:deploy /opt/tradeez
cd /opt/tradeez
cp .env.example .env      # 填 POSTGRES_PASSWORD 与 JWT_SECRET
docker compose up -d
docker compose exec api pnpm db:migrate
```

密钥生成：

```bash
openssl rand -base64 32   # POSTGRES_PASSWORD
openssl rand -base64 48   # JWT_SECRET
```

## 发版

用仓库根的 `scripts/deploy.sh`：本地构建前端 → rsync 上传 → 服务器重建 API 镜像 → 执行迁移。

```bash
./scripts/deploy.sh
```

## 注意事项

**HSTS 一旦下发就难以回退。** `Caddyfile` 里设了一年有效期，浏览器会在此期间强制
HTTPS 访问本站。上线前确认证书链稳定，否则证书出问题时用户无法退回 HTTP 访问。

**index.html 必须不缓存。** 带内容哈希的资源可以 immutable 缓存一年，
但 index.html 缓存会导致发版后用户拿旧壳去引用已删除的 chunk，页面白屏。

**数据库不对公网暴露。** compose 里绑的是 `127.0.0.1:5432`，
远程连接需先 SSH 端口转发：`ssh -L 5432:127.0.0.1:5432 tradeez-server`。

**Postgres 参数按 15G 内存调的**（shared_buffers 2G、effective_cache_size 6G）。
换机器需同步调整 `compose.yml`。

**Redis 用 noeviction 策略。** 它要承载 BullMQ 队列，
用 LRU 淘汰会丢任务，宁可写满报错也不能静默丢。

## 备份

Postgres 数据在 `pgdata` 卷。手工备份：

```bash
docker compose exec -T postgres pg_dump -U tradeez tradeez | gzip > backup-$(date +%F).sql.gz
```

尚未配置自动备份与异地存储 —— 上生产数据前必须补上。
