import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { initializeDatabase } from './database/init-hook';
import { DataSource } from 'typeorm';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  // Initialize database constraints
  try {
    const dataSource = app.get(DataSource);
    await initializeDatabase(dataSource);
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }

  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5174')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
