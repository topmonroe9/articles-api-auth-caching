# NestJS Articles API

A RESTful API built with NestJS that includes authentication, CRUD operations for articles, and data caching.

## Features

- User registration and authentication with JWT
- CRUD operations for articles
- PostgreSQL database integration with TypeORM
- Redis caching for improved performance
- Input validation
- Pagination and filtering for article queries
- Unit tests for business logic

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL
- Redis

## Installation

### Using Docker

The easiest way to set up the project is using Docker:

```bash
# Clone the repository
git clone https://github.com/topmonroe9/articles-api-auth-caching
cd nestjs-articles-api

# Start the containers
docker-compose up -d
```

### Manual Installation

```bash
# Clone the repository
git clone
cd nestjs-articles-api

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database and Redis details

# Run database migrations
npm run migration:run

# Start the application
npm run start:dev
```

## Running Tests

```bash
# Unit tests
npm run test
```
