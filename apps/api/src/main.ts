import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { rawBodyMiddleware } from './middleware/raw-body.middleware';

const whitelist = new Set([
  'http://127.0.0.1:3001',
  'http://localhost:3001',
  'https://kompaniya.centcapio.cc',
]);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  // Apply raw body middleware for webhook signature verification
  app.use(rawBodyMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.enableCors({
    origin: corsOrigin, // DO NOT use "*" with credentials
    credentials: true, // needed for cookies/Auth headers
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Tus-Resumable',
      'Upload-Length',
      'Upload-Metadata',
      'Upload-Offset',
      'Upload-Defer-Length',
      'Upload-Concat',
      'Upload-Checksum',
      'Content-Type',
      'Authorization',
      'X-HTTP-Method-Override',
      'Accept',
      'Origin',
    ],
    exposedHeaders: [
      'Location',
      'Upload-Offset',
      'Upload-Length',
      'Upload-Metadata',
      'Upload-Checksum',
      'Upload-Expires',
      'Tus-Resumable',
    ],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  await app.listen(process.env.PORT ?? 3000);
}

function corsOrigin(
  origin: string | undefined,
  cb: (err: Error | null, allow?: boolean) => void,
) {
  if (!origin) return cb(null, true); // allow curl/Postman and same-origin
  if (whitelist.has(origin)) return cb(null, true);
  cb(new Error('CORS: origin not allowed'));
}
void bootstrap();
