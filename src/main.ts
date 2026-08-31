import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_LOCAL,
    process.env.FRONTEND_PROD,
    'https://500core.vercel.app',
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const isExplicitlyAllowed = allowedOrigins.some(
        (allowed) => origin === allowed || origin.startsWith(allowed),
      );

      const isDynamicLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(
        origin,
      );

      const isVercel =
        origin.endsWith('.vercel.app') ||
        origin.includes('vercel.app');

      if (isExplicitlyAllowed || isDynamicLocalhost || isVercel) {
        return callback(null, true);
      }

      // In development or staging, allow origin
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cookie',
      'Set-Cookie',
    ],
    exposedHeaders: ['Set-Cookie'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('❌ Error starting server:', err);
  process.exit(1);
});
