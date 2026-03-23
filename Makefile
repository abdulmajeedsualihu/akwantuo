# Akwantuo Development Makefile

.PHONY: help dev build lint test clean supabase-types

help:
	@echo "Available commands:"
	@echo "  make dev             - Start development server"
	@echo "  make build           - Build for production"
	@echo "  make lint            - Run ESLint"
	@echo "  make test            - Run tests (Vitest)"
	@echo "  make test-watch      - Run tests in watch mode"
	@echo "  make supabase-init   - Initialize Supabase project"
	@echo "  make supabase-start  - Start local Supabase development"
	@echo "  make supabase-stop   - Stop local Supabase development"
	@echo "  make supabase-status - Check Supabase status"
	@echo "  make supabase-link   - Link to a remote Supabase project"
	@echo "  make supabase-push   - Push local migrations to remote"
	@echo "  make supabase-types  - Generate Supabase types from project"
	@echo "  make install         - Install dependencies"

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

test:
	npm run test

test-watch:
	npm run test:watch

install:
	npm install

# Supabase commands
supabase-init:
	npx supabase init

supabase-start:
	npx supabase start

supabase-stop:
	npx supabase stop

supabase-login:
	npx supabase login

supabase-status:
	npx supabase status

# Replace <PROJECT_REF> with your actual Supabase project reference
supabase-link:
	npx supabase link --project-ref your_project_ref --debug

supabase-push:
	npx supabase db push --include-all

supabase-deploy:
	npx supabase functions deploy analyze-guide-assets --no-verify-jwt

supabase-types:
	npx supabase gen types typescript --local > src/integrations/supabase/types.ts

clean:
	rm -rf dist node_modules
