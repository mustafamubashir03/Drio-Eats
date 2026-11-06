import { Controller, Get, Inject } from '@nestjs/common';
import { Public } from "@thallesp/nestjs-better-auth";
import type { HealthCheckResponse } from '@drio-eats/types';
import * as schema from "./db/schema/index.js"
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

@Controller()
export class AppController {
  constructor(
    @Inject("DB") private db: NeonHttpDatabase
  ) { }

  @Public()
  @Get('db-test')
  async dbTest() {
    // Connectivity probe only — never expose user records on a public route.
    const results = await this.db.select().from(schema.users);
    return { connected: true, userCount: results.length }
  }
  @Public()
  @Get('health')
  health(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: Date.now(),
    }
  }
}