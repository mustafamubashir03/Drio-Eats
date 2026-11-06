import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  // Native (Expo Go) clients authenticate with Bearer tokens but the OS cookie
  // jar may still attach the Better Auth session cookie. When a cookie is
  // present Better Auth treats the request as cookie-based and enforces an
  // Origin check, which native requests cannot satisfy (no Origin header).
  // For bearer-authenticated requests the cookie is redundant, so drop it to
  // keep CSRF/origin validation applicable only to cookie-based (web) flows.
  app.use((req: any, _res: any, next: () => void) => {
    const auth = req.headers?.authorization;
    if (typeof auth === "string" && auth.startsWith("Bearer ") && req.headers?.cookie) {
      delete req.headers.cookie;
    }
    next();
  });
  app.enableCors();
  app.setGlobalPrefix('api')
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Server is running on: http://0.0.0.0:${port}`);
}
await bootstrap();