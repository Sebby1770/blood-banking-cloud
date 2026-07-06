.PHONY: install seed dev backend frontend smoke build start docker-up docker-down deploy-local

install:
	cd backend && npm install
	cd frontend && npm install

seed:
	cd backend && npm run seed

backend:
	cd backend && npm run dev

frontend:
	cd frontend && npm run dev

dev:
	@echo "Start backend (port 4000) and frontend (port 5173) in separate terminals:"
	@echo "  make backend"
	@echo "  make frontend"

smoke:
	cd backend && node _smoke.js

build:
	cd frontend && npm run build

start: build
	cd backend && NODE_ENV=production node server.js

deploy-local: build seed
	cd backend && NODE_ENV=production node server.js

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down