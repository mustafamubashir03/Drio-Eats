import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module.js';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth.js';
import { AuthBusinessModule } from './auth/auth.module.js';
import { RbacModule } from './rbac/rbac.module.js';
import { SuperAdminBootstrap } from './rbac/superadmin.bootstrap.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'server',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    AuthModule.forRoot({ auth }),
    AuthBusinessModule,
    RbacModule,
  ],
  controllers: [AppController],
  providers: [AppService, SuperAdminBootstrap],
})
export class AppModule { }