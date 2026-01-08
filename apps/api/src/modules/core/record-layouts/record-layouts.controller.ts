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
 * Matches the TypeScript interfaces from RecordPageLayout
 */
const updateLayoutSchema = z.object({
  header: z.object({
    title: z.object({
      fieldId: z.string(),
      fallback: z.string().optional(),
      prefix: z.string().optional(),
      suffix: z.string().optional(),
      type: z.enum(['text', 'number', 'date', 'datetime']).optional(),
    }),
    avatar: z
      .object({
        fallbackFieldId: z.string().optional(),
        imageFieldId: z.string().optional(),
      })
      .optional(),
    chips: z
      .array(
        z.object({
          fieldId: z.string(),
          id: z.string(),
          icon: z.string().optional(),
          linkType: z.enum(['mailto', 'tel', 'url']).optional(),
          prefix: z.string().optional(),
          suffix: z.string().optional(),
        }),
      )
      .optional(),
    metadata: z
      .array(
        z.object({
          fieldId: z.string(),
          id: z.string(),
          label: z.string(),
          type: z.enum(['text', 'number', 'date', 'datetime']).optional(),
        }),
      )
      .optional(),
    subtitle: z
      .array(
        z.object({
          fieldId: z.string(),
          prefix: z.string().optional(),
          suffix: z.string().optional(),
          type: z.enum(['text', 'number', 'date', 'datetime']).optional(),
        }),
      )
      .optional(),
  }),
  sectionColumns: z.any().optional(),
  sections: z.array(z.any()).optional().nullable(),
  supplementalFields: z.array(z.any()).optional().nullable(),
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
   * Get custom fields for a specific entity type
   * Returns custom fields in the format needed by the layout builder
   */
  @Get(':entityType/custom-fields')
  async getCustomFields(
    @Param('entityType') entityType: string,
    @ActiveOrganization() organization: { id: string },
  ) {
    return await this.layoutsService.getCustomFieldsForLayout(
      organization.id,
      entityType,
    );
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
