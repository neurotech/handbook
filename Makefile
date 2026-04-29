.PHONY: help build start stop logs rebuild nuke

.DEFAULT_GOAL := help

# Override if needed, e.g. COMPOSE=compose
COMPOSE ?= docker compose

# Host port mapped to container 3000 in compose.yml
PORT ?= 9999

help: ## List Docker targets (default).
	@printf "%s\n" "Targets:"
	@grep -hE '^[a-zA-Z0-9_.-]+:.*?##' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}' | sort -u

build: ## Build Compose image (Dockerfile + lockfile install).
	$(COMPOSE) build

start: ## Start detached. handbook-data volume holds SQLite (/data/dev.db inside container).
	PORT=$(PORT) $(COMPOSE) up -d

stop: ## Stop containers. Named volume survives.
	$(COMPOSE) down

logs: ## Follow app logs.
	$(COMPOSE) logs -f

rebuild: ## rebuild --no-cache after Dockerfile or dependency changes (prisma stays prod dep).
	$(COMPOSE) build --no-cache

nuke: ## down -v: removes handbook-data (wipes SQLite in Docker).
	$(COMPOSE) down -v
