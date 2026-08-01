# Contributing to raseo-sdk

Thank you for your interest in contributing to `raseo-sdk`! This document provides guidelines and instructions for setting up your local development environment.

## Tooling Requirements

- **Node.js**: `>=18.0.0`
- **Package Manager**: `pnpm` (v10.x recommended)

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TeamRaseo/raseo-sdk.git
   cd raseo-sdk
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

## Development Workflow

- **Typecheck the codebase**:
  ```bash
  pnpm typecheck
  ```

- **Build the SDK** (generates dual ESM/CJS bundles + `.d.ts` declarations):
  ```bash
  pnpm build
  ```

- **Run unit tests** (uses Node's native test runner via `tsx`):
  ```bash
  pnpm test
  ```

- **Run build watch mode during local iteration**:
  ```bash
  pnpm dev
  ```

## Architecture & Conventions

- **Single Package**: `raseo-sdk` is published as a single package with flat subpath exports (`raseo-sdk/openai`, `raseo-sdk/anthropic`, `raseo-sdk/gemini`, `raseo-sdk/session`).
- **Provider Peer Dependencies**: Provider SDKs (OpenAI, Anthropic, Gemini) are optional peer dependencies. Do not add required heavy provider dependencies to the core SDK package.
- **Validation**: `zod` is used for schema and contract validation across the codebase.
