import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { type Organization } from '@repo/database/schema';
import { type RecordLayoutEntityType } from '@repo/domain';

import { ActiveOrganization } from '~/modules/organization/decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '~/modules/organization/guards/active-organization/active-organization.guard';

import { ReferenceDiscoveryService } from './reference-discovery.service';
import { RelatedRecordsService } from './related-records.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/references')
export class ReferencesController {
  constructor(
    private readonly referenceDiscoveryService: ReferenceDiscoveryService,
    private readonly relatedRecordsService: RelatedRecordsService,
  ) {}

  @Get('discover')
  async discoverReferences(
    @Query('entityType') entityType: RecordLayoutEntityType,
    @ActiveOrganization() organization: Organization,
  ) {
    if (!entityType) {
      return [];
    }

    return await this.referenceDiscoveryService.findReferencingEntities(
      entityType,
      organization.id,
    );
  }

  @Get('related')
  async getRelatedRecords(
    @Query('targetEntityType') targetEntityType: RecordLayoutEntityType,
    @Query('targetRecordId') targetRecordId: string,
    @Query('sourceEntityType') sourceEntityType: RecordLayoutEntityType,
    @Query('fieldName') fieldName: string,
    @Query('fieldType') fieldType: 'original' | 'custom',
    @Query('page') page: string | number = 1,
    @Query('perPage') perPage: string | number = 10,
    @ActiveOrganization() organization: Organization,
  ) {
    const parsedPage =
      typeof page === 'string' ? Number.parseInt(page, 10) : page;
    const parsedPerPage =
      typeof perPage === 'string' ? Number.parseInt(perPage, 10) : perPage;

    return await this.relatedRecordsService.getRelatedRecords({
      targetEntityType,
      targetRecordId,
      sourceEntityType,
      fieldName,
      fieldType,
      page: Number.isFinite(parsedPage) ? parsedPage : 1,
      perPage: Number.isFinite(parsedPerPage) ? parsedPerPage : 10,
      organizationId: organization.id,
    });
  }
}
