import { Module } from '@nestjs/common';

import { CacheModule } from '../cache/cache.module';
import { CustomFieldDefinitionsController } from './custom-field-definitions.controller';
import { CustomFieldDefinitionsService } from './custom-field-definitions.service';
import { CustomFieldQueryService } from './custom-field-query.service';
import { CustomFieldValidationService } from './custom-field-validation.service';

@Module({
  imports: [CacheModule],
  controllers: [CustomFieldDefinitionsController],
  providers: [
    CustomFieldDefinitionsService,
    CustomFieldValidationService,
    CustomFieldQueryService,
  ],
  exports: [
    CustomFieldDefinitionsService,
    CustomFieldValidationService,
    CustomFieldQueryService,
  ],
})
export class CustomFieldsModule {}
