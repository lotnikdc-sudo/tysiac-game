# Build backend
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/src ./src
COPY backend/tsconfig.json ./
RUN npm run build

# Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend . .
RUN npm run build

# Production
FROM node:18-alpine
WORKDIR /app
COPY --from=backend-build /app/backend ./backend
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=frontend-build /app/frontend/build ./frontend/build
RUN cd backend && npm install --production

ENV PORT=8000
ENV NODE_ENV=production

EXPOSE 8000

CMD ["node", "backend/dist/server.js"]
