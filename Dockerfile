# ============================================
# Stage 1: Build the Vue app
# ============================================
FROM node:24.14.0 AS builder

WORKDIR /app

# 先复制 package.json 和 pnpm-lock.yaml，利用 Docker 缓存依赖层
COPY package.json pnpm-lock.yaml ./

# 安装依赖（pnpm-lock.yaml 没变时不重新安装）
RUN corepack enable pnpm && pnpm install

# 复制源码
COPY . .

# 构建生产版本（.env.production 被 loadEnv 读取）
RUN pnpm build

# ============================================
# Stage 2: Serve with nginx
# ============================================
FROM nginx:alpine

# 删除默认 nginx 配置
RUN rm /etc/nginx/conf.d/default.conf

# 从构建阶段复制静态文件
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
