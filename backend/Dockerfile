# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Generate Prisma Client (needed for TypeScript compilation)
# Note: Prisma 7 reads DATABASE_URL from prisma.config.ts
# Use a dummy URL for build-time generation (will be regenerated at runtime)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Generate Prisma Client for production
# Note: Prisma 7 reads DATABASE_URL from prisma.config.ts
# Use a dummy URL for build-time generation (will be regenerated at runtime with correct URL)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Start application
# Note: Prisma generate and migrate will be run in docker-compose command
CMD ["npm", "run", "start:prod"]

