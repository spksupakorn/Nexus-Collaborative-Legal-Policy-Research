FROM node:18-alpine AS builder

WORKDIR /app

# Copy everything including built dist
COPY . .

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Start compiled server
CMD ["node", "dist/index.js"]
