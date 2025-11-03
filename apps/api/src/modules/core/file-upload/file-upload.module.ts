import { Global, Module } from '@nestjs/common';

import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
@Global()
@Module({
  providers: [FileUploadService],
  controllers: [FileUploadController],
  exports: [FileUploadService],
})
export class FileUploadModule {}
