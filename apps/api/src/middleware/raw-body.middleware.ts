import type { NextFunction, Request, Response } from 'express';

import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const chunks: Buffer[] = [];

    // Collect raw body chunks
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const rawBody = Buffer.concat(chunks);
      req.rawBody = rawBody;

      // Also parse as JSON for the @Body() decorator
      try {
        if (rawBody.length > 0) {
          req.body = JSON.parse(rawBody.toString()) as unknown;
        } else {
          req.body = null;
        }
      } catch {
        // If not valid JSON, leave body as-is
        req.body = rawBody.toString();
      }

      next();
    });

    // Handle errors
    req.on('error', (err) => {
      next(err);
    });
  }
}

export function rawBodyMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const chunks: Buffer[] = [];

  req.on('data', (chunk: Buffer) => {
    chunks.push(chunk);
  });

  req.on('end', () => {
    const rawBody = Buffer.concat(chunks);
    req.rawBody = rawBody;

    try {
      if (rawBody.length > 0) {
        req.body = JSON.parse(rawBody.toString()) as unknown;
      } else {
        req.body = null;
      }
    } catch {
      req.body = rawBody.toString();
    }

    next();
  });

  req.on('error', (err) => {
    next(err);
  });
}
