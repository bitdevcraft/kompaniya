# Web Dockerfile - Next.js Production Build (standalone output)

# Stage 1: Install dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
COPY packages/domain/package.json ./packages/domain/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui-common/package.json ./packages/ui-common/
COPY packages/ui-data-table/package.json ./packages/ui-data-table/
COPY packages/ui-email-editor/package.json ./packages/ui-email-editor/
COPY packages/ui-mjml-editor/package.json ./packages/ui-mjml-editor/
COPY packages/ui-monaco-editor/package.json ./packages/ui-monaco-editor/

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Stage 2: Build shared packages and Next.js app
FROM node:18-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/web ./apps/web

# Build shared packages first
RUN pnpm --filter @repo/database build
RUN pnpm --filter @repo/domain build
RUN pnpm --filter @repo/shared build
RUN pnpm --filter @kompaniya/ui-common build
RUN pnpm --filter @kompaniya/ui-data-table build
RUN pnpm --filter @kompaniya/ui-email-editor build
RUN pnpm --filter @kompaniya/ui-mjml-editor build
RUN pnpm --filter @kompaniya/ui-monaco-editor build

# Build Next.js app (with standalone output)
RUN pnpm --filter web build

# Stage 3: Production runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output from builder
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Switch to non-root user
USER nextjs

EXPOSE 3001

# Start Next.js server.js from standalone output
CMD ["node", "server.js"]
