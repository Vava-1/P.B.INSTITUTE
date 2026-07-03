# ─── Build stage ───
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies for native modules (bcrypt needs nothing extra on slim,
# but mysql2 is pure JS so this is fine).
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source
COPY . .

# Build the SPA + server bundle
RUN npm run build

# ─── Production stage ───
FROM node:20-slim AS runner

WORKDIR /app

# Install only production deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts (dist/public for SPA, dist/boot.js for server)
COPY --from=builder /app/dist ./dist

# Copy schema + migrations so `drizzle-kit` can run in the release phase
COPY db ./db
COPY drizzle.config.ts ./
COPY contracts ./contracts

ENV NODE_ENV=production
ENV PORT=3000

# Railway injects PORT automatically; expose it.
EXPOSE 3000

# Healthcheck — Railway uses this to know when the container is ready.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Start the server
CMD ["node", "dist/boot.js"]
