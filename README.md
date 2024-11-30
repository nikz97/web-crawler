# Express API Server

A lightweight Express.js API server with TypeScript support, part of a Turborepo monorepo architecture.

## Features

- Express.js server with TypeScript
- CORS enabled
- Body parser middleware
- Morgan logging
- Health check endpoint
- Message endpoint with name parameter

## API Endpoints

- `GET /status` - Health check endpoint
- `GET /message/:name` - Returns a greeting message with the provided name

## Getting Started

1. Install dependencies:
```bash
npm install
