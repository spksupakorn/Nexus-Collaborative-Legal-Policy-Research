# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and tsconfig
COPY package*.json tsconfig.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files and tsconfig
COPY package*.json tsconfig.json ./

# Install only production dependencies
RUN npm ci --only=production && \
  npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/v1/dashboard', (r) => {process.exit(r.statusCode === 401 ? 0 : 1)})"

CMD ["node", "dist/index.js"]