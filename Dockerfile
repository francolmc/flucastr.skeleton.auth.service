# Use Node.js 18 Alpine for smaller image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 3002

# Labels
LABEL maintainer="Flucastr <dev@flucastr.com>"
LABEL service="flucastr.auth.service.skeleton"
LABEL description="Skeleton del microservicio de autenticación para la plataforma Flucastr"

# Run migrations and start the application
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && pnpm start:prod"]