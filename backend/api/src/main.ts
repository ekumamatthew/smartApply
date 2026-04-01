import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { randomUUID } from 'node:crypto';
import { type Request, type Response, type NextFunction } from 'express';
import { AppModule } from './app.module';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import { getAllowedOrigins, isAllowedOrigin } from './lib/origins';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = req.header('x-request-id') || randomUUID();
    (req as Request & { requestId?: string }).requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  });

  // Enable CORS
  const allowedOrigins = getAllowedOrigins();
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (isAllowedOrigin(origin, allowedOrigins)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  });

  // Better Auth routes (sign-in/sign-up/session/social callbacks)
  app.use('/api/auth', toNodeHandler(auth));

  // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap().catch((error: unknown) => {
  console.error('Failed to start application', error);
  process.exit(1);
});
