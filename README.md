
# Api `hibrid-api-express-refactor` (Express + Sequelize REST API)

A scalable, production-ready RESTful API starter kit generated with servers-creator CLI. Built with Express 5, TypeScript, **Sequelize v6 (PostgreSQL)**, and Session-based Authentication.

## Summary

A scalable and modern REST API boilerplate built with Express, TypeScript and **Sequelize v6 (PostgreSQL)**. Designed to kickstart backend services with clean project structure, environment configuration, and standard error handling out of the box.

### How to Proceed (Getting Started)

Follow these steps to set up and run your project locally.

1. **Prerequisites**

Ensure you have installed:

Node.js: v20 or higher
Package Manager: npm, pnpm, or yarn
PostgreSQL Database: Running locally or via Docker

2. **Install Dependencies**
npm install

### 3. Environment Setup
Create your local environment configuration file from the template:
```bash
cp .env.example .env.development
```
#### Environment Variables Reference
| Variable | Description | Default / Example | Required |
| :--- | :--- | :--- | :--- |
| `PORT` | Server listening port | `3000` | No |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@localhost:5432/db` | Yes |
| `SESSION_SECRET` | Secret key used for session cookie encryption | `super_secret_key` | Yes |

#### Configure your database connection parameters inside .env.development:

```bash

PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/dbName
SESSION_SECRET=super_secret_session_key

```

4. **Database Setup**

Ensure PostgreSQL is running and the database specified in DATABASE_URL exists.


### Initialize database with Sequelize

The models come pre-configured, though you can modify or add tables, columns, and rows.
Table declarations do not use decorators; instead, for the sake of compatibility, they use the old standard API (`InferAttributes`, `InferCreationAttributes`).

The project uses the stable Sequelize 6 version. However, with the current configuration, you can switch to version 7—which, as of today, is still in alpha (e.g., 7.0.0-alpha.48).
If you wish to use `sequelize-cli`, you must use `sequelize` v6.

You can initialize the database by passing `true` as a parameter to `startUp`, which enables the `sync` method with `force: false`; passing a second `true` enables `force: true`. Keep in mind that this method overwrites all tables, resulting in data loss. 

Alternatively, you can initialize the database by installing `sequelize-cli` and creating or running a migration.


Examples 

```javascript
//src/index.ts
import app from './app.js'
import { startUp } from './configs/database.js'
import envConfig from './configs/envConfig.js'

async function serverBootstrap(){
    try{
      await startUp(true, true) //(force:true)
      app.listen(envConfig.Port, () => {
        console.log(`Server listening on port ${envConfig.Port}`)
      })
    }catch(error){
        console.error('Error initializing server: ',error)
        process.exit(1)
    }
}
serverBootstrap()
```


### Architecture Overview

This project follows a Feature-First / Modular Architecture combined with layered separation of concerns. This ensures high maintainability, testability, and scalability as your API grows.

### Key Architectural Concepts

#### Feature Modules (src/features/)

Each domain feature (auth, user, system-logs) is self-contained with its routes, controllers, services, and integration tests.
Keeps business logic organized by domain rather than scattering files across single global folders.

#### Shared Layer (src/shared/)

#### Repositories 

Encapsulate database queries and data abstraction layers.
        
#### Auth Middlewares

Handle session validation, cookie parsing, and CSRF protection (csrfProtection, setCsrfToken, verifyCsrfToken).

#### Interfaces & Utilities

Common helper functions and TypeScript types shared across features.

### Centralized Configurations (src/configs/)

#### Environment Management (envConfig.ts)

Strongly-typed environment configuration supporting .env.development, .env.test, and .env.production.
        
#### Database Connection (database.ts)

Manages Sequelize initialization, ORM models, and startup synchronization.


#### Logger (logger.ts)

Structured logging powered by Pino and HTTP request logging with Morgan.

#### Error Handling (errors.ts)

Centralized Express middleware for standardizing error responses across all endpoints. All errors follow a predictable JSON contract:

```json
{
  "error": {
    "ok": false,
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials provided",
  }
}
```

Database Models (src/models/):

Explicit Sequelize v6 models (user.model.ts, log.model.ts) mapped cleanly to PostgreSQL tables.

## Project Directory Structure

```text
hibrid-api-express-refactor/
├── src/
│   ├── index.ts                # Application entrypoint & server bootstrap
│   ├── app.ts                  # Express application configuration & middleware pipeline
│   ├── routes.ts               # Main API routing table (/api/v1/...)
│   ├── configs/                # DB, Logger, Error handlers & Environment configs
│   ├── features/               # Modular features (Domain-driven)
│   │   ├── auth/               # Authentication routes, controllers & tests
│   │   ├── user/               # User management feature module
│   │   └── system-logs/        # Audit & system log endpoints
│   ├── models/                 # Sequelize database models
│   └── shared/                 # Shared functions, repositories, utilities & dependencies
├── .env.example                # Template for environment variables
├── .env.development            # Development environment variables
├── .env.test                   # Test environment configuration
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript compiler configuration
└── vitest.config.ts            # Vitest testing setup

```


## Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts server in dev mode with live reload (`tsx watch`) |
| **Testing** | `npm run test` | Runs unit & integration tests via Vitest |
| **Build** | `npm run build` | Compiles TypeScript into `/dist` directory |
| **Production** | `npm run start` | Runs compiled JavaScript from `/dist` |
| **Linting** | `npm run lint` | Lints TypeScript files using ESLint |

---

## Main API Endpoints

All endpoints are prefixed with `/api/v1`.

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Authentication | Required Payload / Query |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/login` | Log in and create session/token | Public | `{ email, password }` |
| `POST` | `/logout` | User logout & session destruction | Required | None |
| `GET` | `/me` | Retrieve current session status | Required | None |

### User Management (`/api/v1/user`)

| Method | Endpoint | Description | Authentication | Required Payload / Query |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Retrieve user profiles | Required (not implemented yet)| `?page=1&limit=10` |
| `POST` | `/` | Create a new user | Admin (not implemented yet)| `{ name, email, role }` |
| `GET` | `/:id` | Fetch user details | Required (not implemented yet)| Path parameter `:id` |

### System Logs (`/api/v1/logs`)

| Method | Endpoint | Description | Authentication | Required Payload / Query |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Fetch audit & system logs | Admin (not implemented yet)| `?level=error&limit=50` |
