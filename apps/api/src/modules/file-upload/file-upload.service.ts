import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FileStore } from '@tus/file-store';
import { EVENTS, Server } from '@tus/server';
import { existsSync, mkdirSync } from 'node:fs';
import { IncomingMessage, ServerResponse } from 'node:http';
import { join } from 'node:path';

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
    process.env.FILE_UPLOAD_ENDPOINT ?? '/api/file-upload';

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {
    if (!existsSync(this.storagePath)) {
      mkdirSync(this.storagePath, { recursive: true });
      this.logger.log(`Created upload directory at ${this.storagePath}`);
    }

    this.server = new Server({
      path: this.uploadEndpoint,
      datastore: new FileStore({ directory: this.storagePath }),
      respectForwardedHeaders: true,
    });

    this.server.on(EVENTS.POST_FINISH, (event: TusUploadCompleteEvent) => {
      this.logger.log(
        `Upload complete for file ${event.file.id} (${event.file.upload_length ?? 'unknown'} bytes)`,
      );
    });
  }

  getEndpoint() {
    return this.uploadEndpoint;
  }

  getUploadFilePath(uploadId: string) {
    return join(this.storagePath, uploadId);
  }

  async getUploadMetadata(uploadId: string) {
    if (!(this.server.datastore instanceof FileStore)) {
      throw new Error('Unsupported datastore for metadata retrieval');
    }

    const upload = await this.server.datastore.getUpload(uploadId);
    const metadata = upload.metadata ?? {};

    return Object.fromEntries(
      Object.entries(metadata).map(([key, value]) => [key, value ?? '']),
    );
  }

  handleTus(req: IncomingMessage, res: ServerResponse) {
    return this.server.handle(req, res);
  }

  onModuleInit() {}
}
