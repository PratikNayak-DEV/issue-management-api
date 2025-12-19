// Prisma 7 Configuration File
// This file handles database connection configuration
import 'dotenv/config';
import { defineConfig } from '@prisma/client';

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
