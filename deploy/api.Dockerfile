# 多阶段构建。context 为仓库根，因为要拿 packages/shared
FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable pnpm
WORKDIR /app

# ---- 依赖层：只拷清单，让 lockfile 未变时能命中缓存 ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile --filter @tradeez/api...

# ---- 构建层 ----
FROM deps AS build
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
# shared 必须先构建：其 exports 指向 dist，api 编译要它的 .d.ts，运行时要它的 .js
RUN pnpm --filter @tradeez/shared build && pnpm --filter @tradeez/api build

# ---- 运行层：仅生产依赖，不含 devDependencies ----
FROM base AS runtime
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile --prod --filter @tradeez/api...

# 拷 shared 的编译产物而非源码 —— Node 运行时无法 import .ts
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/apps/api/dist ./apps/api/dist
# 迁移文件随镜像走，便于在容器内执行 migrate
COPY apps/api/drizzle ./apps/api/drizzle
COPY apps/api/drizzle.config.ts ./apps/api/

# 以非 root 运行
USER node
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/main.js"]
