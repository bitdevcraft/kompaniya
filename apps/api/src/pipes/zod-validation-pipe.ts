import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      console.log(value);
      const parsedValue = this.schema.parse(value);
      return parsedValue;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      throw new BadRequestException('Validation failed');
    }
  }
}
