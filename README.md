# Multi-Tenant Issue & Activity Management API

A production-ready NestJS backend system for multi-tenant issue tracking with role-based authorization and activity logging.

---

## 🏗️ Architecture Overview

### Tech Stack
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: class-validator, class-transformer
- **API Style**: REST (JSON)

### Project Structure
src/
├── common/ # Shared guards, decorators, enums
├── prisma/ # Database service
├── issues/ # Issue management module
├── activity/ # Activity logging module
└── app.module.ts # Root module


---

## 📦 Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Installation

