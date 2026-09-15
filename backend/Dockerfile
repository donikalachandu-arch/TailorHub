# ==========================================
# TailorHub Backend Production Multi-Stage Dockerfile
# Optimized for Render, Railway, Google Cloud Run
# ==========================================

# Stage 1: Build TypeScript
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci

COPY src ./src
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Create SQLite storage directory if using local DB
RUN mkdir -p /app/data

EXPOSE 5000

CMD ["node", "dist/server.js"]
