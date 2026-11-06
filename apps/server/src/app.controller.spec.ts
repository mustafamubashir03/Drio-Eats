import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

describe('AppController', () => {
  let appController: AppController;
  const mockDb = {
    select: () => ({
      from: () => Promise.resolve([]),
    }),
  } as unknown as NeonHttpDatabase;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: 'DB', useValue: mockDb },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return ok status with timestamp', () => {
      const result = appController.health();
      expect(result.status).toBe('ok');
      expect(typeof result.timestamp).toBe('number');
    });
  });
});
