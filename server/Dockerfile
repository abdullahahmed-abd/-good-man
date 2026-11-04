# syntax=docker/dockerfile:1

# Stage 1: Build dependencies & compilation
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configurations and package definitions
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

# Install all dependencies (including devDependencies for TypeScript compilation)
RUN npm ci

# Copy source code
COPY shared/ ./shared/
COPY server/ ./server/

# Build shared library first, then backend
RUN npm --workspace=shared run build
RUN npm --workspace=server run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Create unprivileged user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 insaan -G nodejs

# Copy root manifests and workspace configs
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

# Copy built shared package from builder so workspace linking has dist available
COPY --from=builder /app/shared/dist ./shared/dist

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy remaining built outputs from builder
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/drizzle ./server/drizzle

# Set file ownership to non-root user
RUN chown -R insaan:nodejs /app

USER insaan

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "server/dist/index.js"]
