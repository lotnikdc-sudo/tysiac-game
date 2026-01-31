## Robust multi-stage Dockerfile
FROM node:18-alpine AS deps-backend
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --silent || npm install --silent

FROM deps-backend AS build-backend
WORKDIR /app/backend
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

FROM node:18-alpine AS deps-frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --silent || npm install --silent

FROM deps-frontend AS build-frontend
WORKDIR /app/frontend
COPY frontend/ .
RUN npm run build

# Final image
FROM node:18-alpine AS runner
WORKDIR /app

# Copy backend build artifacts and production deps
COPY --from=build-backend /app/backend/dist ./backend/dist
COPY --from=deps-backend /app/backend/node_modules ./backend/node_modules
COPY backend/package.json ./backend/package.json

# Copy frontend build
COPY --from=build-frontend /app/frontend/build ./frontend/build

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

# Ensure server uses PORT env variable
CMD ["node", "backend/dist/server.js"]
