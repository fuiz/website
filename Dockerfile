# Stage 1: Build
FROM oven/bun:alpine AS builder

WORKDIR /app

COPY package.json bun.lock* ./

RUN bun install

COPY . .

# Build with node adapter
ENV ADAPTER=node

RUN bun run build

# Stage 2: Runtime
FROM oven/bun:alpine

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV PORT=3000
EXPOSE 3000

# PUBLIC_* and ORIGIN env vars are read at runtime by SvelteKit's dynamic env module
CMD ["bun", "/app/build/index.js"]
