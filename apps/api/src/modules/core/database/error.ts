import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class DatabaseErrorService {
  internalServerError(
    message = 'Internal server error',
  ): InternalServerErrorException {
    return new InternalServerErrorException(message);
  }
}
