import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import type { HealthCheckResponse } from '@drio-eats/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('health')
  health(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: Date.now(),
    }
  }

}
