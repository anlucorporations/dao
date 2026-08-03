.PHONY: install db-up db-down db-logs db-migrate db-seed web-dev web-build contracts-build contracts-test test local-up local-down local-logs

install:
	cd web && npm install

local-up:
	docker compose up --build -d

local-down:
	docker compose down -v

local-logs:
	docker compose logs -f

db-up:
	docker compose up -d postgres

db-down:
	docker compose down

db-logs:
	docker compose logs -f postgres

db-migrate:
	cd web && npm run db:push

db-seed:
	cd web && npm run db:seed

web-dev:
	cd web && npm run dev

web-build:
	cd web && npm run build

contracts-build:
	cd contracts && forge build

contracts-test:
	cd contracts && forge test

test:
	cd web && npm test
