# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client (needed for TypeScript compilation)
# Note: prisma generate doesn't need DATABASE_URL - it only reads schema.prisma
RUN npx prisma generate

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

# Install production dependencies only
RUN npm ci --omit=dev

# Generate Prisma Client for production
# This ensures the client is available even if runtime generation fails
# Will be regenerated at runtime with correct DATABASE_URL in start:prod script
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Start application
# Note: Prisma generate and migrate will be run in docker-compose command
CMD ["npm", "run", "start:prod"]

