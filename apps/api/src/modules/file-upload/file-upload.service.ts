import type { Express, RequestHandler } from 'express';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { EVENTS, FileStore, Server } from 'tus-node-server';

type TusUploadCompleteEvent = {
  file: {
    id: string;
    upload_length?: string;
    upload_metadata?: string;
    size?: number;
  };
};

@Injectable()
export class FileUploadService implements OnModuleInit {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly server: Server;
  private readonly storagePath =
    process.env.FILE_UPLOAD_DIR ?? join(process.cwd(), 'storage', 'uploads');
  private readonly uploadEndpoint =
    process.env.FILE_UPLOAD_ENDPOINT ?? '/api/uploads';

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {
    if (!existsSync(this.storagePath)) {
      mkdirSync(this.storagePath, { recursive: true });
      this.logger.log(`Created upload directory at ${this.storagePath}`);
    }

    this.server = new Server({
      path: this.uploadEndpoint,
    });
    this.server.datastore = new FileStore({ directory: this.storagePath });

    this.server.on(
      EVENTS.EVENT_UPLOAD_COMPLETE,
      (event: TusUploadCompleteEvent) => {
        this.logger.log(
          `Upload complete for file ${event.file.id} (${event.file.upload_length ?? 'unknown'} bytes)`,
        );
      },
    );
  }

  getEndpoint() {
    return this.uploadEndpoint;
  }

  onModuleInit() {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    if (!httpAdapter) {
      this.logger.warn(
        'HttpAdapterHost is not available; skipping tus server mounting.',
      );
      return;
    }

    const maybeApp: unknown = httpAdapter.getInstance();

    if (
      !maybeApp ||
      typeof maybeApp !== 'function' ||
      typeof (maybeApp as Express).all !== 'function'
    ) {
      this.logger.error('Tus uploads require the Express adapter.');
      return;
    }

    const app: Express = maybeApp as Express;
    const handler: RequestHandler = (req, res) => {
      void this.server.handle(req, res);
    };

    const routes = [this.uploadEndpoint, `${this.uploadEndpoint}/:fileId`];
    routes.forEach((route) => app.all(route, handler));

    this.logger.log(`Tus upload endpoint registered at ${this.uploadEndpoint}`);
  }
}
