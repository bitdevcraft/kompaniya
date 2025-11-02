import { All, Controller, Req, Res } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'node:http';

import { FileUploadService } from './file-upload.service';

@Controller('api/file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @All()
  tus(@Req() req: IncomingMessage, @Res() res: ServerResponse) {
    return this.fileUploadService.handleTus(req, res);
  }
  @All(':id')
  tusFile(@Req() req: IncomingMessage, @Res() res: ServerResponse) {
    return this.fileUploadService.handleTus(req, res);
  }
}
