FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev
COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=4000
ENV DATABASE_URL=sqlite:./backend/data/blood_bank.sqlite

RUN mkdir -p /app/backend/data

EXPOSE 4000
WORKDIR /app/backend
RUN chmod +x entrypoint.sh
CMD ["./entrypoint.sh"]