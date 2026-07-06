.PHONY: install seed dev backend frontend smoke build

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