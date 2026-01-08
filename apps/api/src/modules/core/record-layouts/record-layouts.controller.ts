import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { z } from 'zod';

import { ActiveOrganization } from '~/modules/organization/decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '~/modules/organization/guards/active-organization/active-organization.guard';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { RecordLayoutsService } from './record-layouts.service';

/**
 * Schema for validating layout updates
 */
const updateLayoutSchema = z.object({
  header: z.object({
    title: z.object({ fieldId: z.string() }),
    avatar: z
      .object({
        fallbackFieldId: z.string().optional(),
        imageFieldId: z.string().optional(),
      })
      .optional(),
    chips: z.array(z.any()).optional(),
    metadata: z.array(z.any()).optional(),
    subtitle: z.array(z.any()).optional(),
  }),
  sectionColumns: z.any().optional(),
  sections: z.array(z.any()).optional(),
  supplementalFields: z.array(z.any()).optional(),
  autoIncludeCustomFields: z.boolean().optional(),
});

type UpdateLayoutDto = z.infer<typeof updateLayoutSchema>;

/**
 * Valid entity types for record layouts
 */
const validEntityTypes = new Set([
  'org_accounts',
  'org_activities',
  'org_categories',
  'org_contacts',
  'org_email_campaigns',
  'org_email_clicks',
  'org_email_domains',
  'org_email_templates',
  'org_email_test_receivers',
  'org_emails',
  'org_events',
  'org_leads',
  'org_opportunities',
  'org_payment_plan_templates',
  'org_payment_plans',
  'org_real_estate_booking_buyers',
  'org_real_estate_bookings',
  'org_real_estate_projects',
  'org_real_estate_properties',
  'org_tags',
  'org_tasks',
]);

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/record-layouts')
export class RecordLayoutsController {
  constructor(private readonly layoutsService: RecordLayoutsService) {}

  /**
   * Get all layouts for the active organization
   */
  @Get()
  async getAll(@ActiveOrganization() organization: { id: string }) {
    return await this.layoutsService.getAllLayouts(organization.id);
  }

  /**
   * Get layout for a specific entity type
   */
  @Get(':entityType')
  async getLayout(
    @Param('entityType') entityType: string,
    @ActiveOrganization() organization: { id: string },
  ) {
    if (!validEntityTypes.has(entityType)) {
      return await this.layoutsService.getLayout(organization.id, entityType);
    }
    return await this.layoutsService.getLayout(organization.id, entityType);
  }

  /**
   * Reset layout to default
   */
  @Delete(':entityType')
  async resetToDefault(
    @Param('entityType') entityType: string,
    @ActiveOrganization() organization: { id: string },
  ) {
    return await this.layoutsService.resetToDefault(
      organization.id,
      entityType,
    );
  }

  /**
   * Create or update a custom layout
   */
  @Post(':entityType')
  async upsertLayout(
    @Param('entityType') entityType: string,
    @ActiveOrganization() organization: { id: string },
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(updateLayoutSchema)) body: UpdateLayoutDto,
  ) {
    return await this.layoutsService.upsertLayout(
      organization.id,
      entityType,
      body,
      session.user.id,
    );
  }
}
