# ─── Build stage ───
FROM node:20-slim AS builder

WORKDIR /app

# Install all dependencies (including devDeps for build tools).
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source.
COPY . .

# Build the SPA + server bundle.
RUN npm run build

# ─── Production stage ───
FROM node:20-slim AS runner

WORKDIR /app

# Install production deps + drizzle-kit (needed to push schema on startup).
# drizzle-kit is in devDependencies, so install it explicitly.
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force
RUN npm install drizzle-kit tsx --no-save

# Copy built artifacts (dist/public for SPA, dist/boot.js for server).
COPY --from=builder /app/dist ./dist

# Copy schema + config so drizzle-kit can push the schema at startup.
COPY db ./db
COPY drizzle.config.ts ./
COPY contracts ./contracts
COPY package.json ./package.json

ENV NODE_ENV=production
ENV PORT=3000

# Railway injects PORT automatically; expose it.
EXPOSE 3000

# Healthcheck — Railway uses this to know when the container is ready.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Startup: push schema (creates/alters tables to match schema.ts), then boot.
# drizzle-kit push is idempotent and safe to run on every deploy.
CMD ["sh", "-c", "npx drizzle-kit push --force && node dist/boot.js"]
