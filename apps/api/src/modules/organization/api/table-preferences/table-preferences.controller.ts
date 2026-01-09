import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { type Organization } from '@repo/database/schema';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { z } from 'zod';

import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { type UpdateTablePreferencesDto } from './dto/update-table-preferences.dto';
import { TablePreferencesService } from './table-preferences.service';

const updateTablePreferencesSchema = z.object({
  visibility: z.record(z.string(), z.boolean()),
});

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/table-preferences')
export class TablePreferencesController {
  constructor(private readonly tablePreferences: TablePreferencesService) {}

  @Get(':entityType')
  async getPreferences(
    @Param('entityType') entityType: string,
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
  ) {
    return await this.tablePreferences.getPreferences(
      organization.id,
      session.user.id,
      entityType,
    );
  }

  @Patch(':entityType')
  async updatePreferences(
    @Param('entityType') entityType: string,
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(updateTablePreferencesSchema))
    body: UpdateTablePreferencesDto,
  ) {
    return await this.tablePreferences.updateVisibility(
      organization.id,
      session.user.id,
      entityType,
      body.visibility,
    );
  }
}
