// prisma.config.ts
import 'dotenv/config'; // Explicitly loads environment variables from .env
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  // Configure the datasource URL for Prisma CLI commands like 'migrate'
  datasource: {
    url: env('DATABASE_URL'),
  },
});
