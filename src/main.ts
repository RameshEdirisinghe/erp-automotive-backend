import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(3000);
  console.log('🚀 Server running on http://localhost:3000');
}
bootstrap();
