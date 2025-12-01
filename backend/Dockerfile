# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
# Note: Prisma Client will be generated at runtime with correct DATABASE_URL
# This ensures the client uses the actual database URL from environment variables
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Note: Prisma Client will be generated at runtime with correct DATABASE_URL
# Do NOT copy .prisma from builder stage to avoid using wrong DATABASE_URL

# Expose port
EXPOSE 3001

# Start application
# Note: Prisma generate and migrate will be run in docker-compose command
CMD ["npm", "run", "start:prod"]

