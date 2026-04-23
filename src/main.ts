import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors'
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}));
  app.use(
  helmet({
    crossOriginOpenerPolicy: false, 
  }),
    hpp()
);
app.use(cookieParser());

app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://chat-ai-lilac-mu.vercel.app',
    ],
    credentials: true,
  }),
  app.setGlobalPrefix('api')
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
