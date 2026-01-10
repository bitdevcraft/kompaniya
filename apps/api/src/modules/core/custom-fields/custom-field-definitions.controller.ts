import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type Organization } from '@repo/database/schema';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { z } from 'zod';

import { ActiveOrganization } from '~/modules/organization/decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '~/modules/organization/guards/active-organization/active-organization.guard';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { CustomFieldDefinitionsService } from './custom-field-definitions.service';

const referenceConfigSchema = z.object({ targetType: z.string() });

// Zod schemas for validation
const createDefinitionSchema = z
  .object({
    entityType: z.string().min(1),
    key: z.string().regex(/^[a-zA-Z0-9_-]{1,50}$/, {
      message: 'Key must be alphanumeric with underscores/hyphens (1-50 chars)',
    }),
    label: z.string().min(1),
    description: z.string().optional(),
    fieldType: z.enum([
      'string',
      'number',
      'boolean',
      'date',
      'datetime',
      'single_select',
      'multi_select',
      'json',
      'reference',
    ]),
    isRequired: z.boolean().default(false),
    defaultValue: z.any().optional(),
    choices: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
        }),
      )
      .optional(),
    validation: z.record(z.string(), z.any()).optional(),
    isIndexed: z.boolean().default(false),
    referenceConfig: referenceConfigSchema.optional(),
  })
  .strict();

const updateDefinitionSchema = createDefinitionSchema
  .partial()
  .omit({ key: true })
  .strict();

type CreateDefinitionDto = z.infer<typeof createDefinitionSchema>;
type UpdateDefinitionDto = z.infer<typeof updateDefinitionSchema>;

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/custom-fields')
export class CustomFieldDefinitionsController {
  constructor(
    private readonly definitionsService: CustomFieldDefinitionsService,
  ) {}

  /**
   * Create a new field definition
   * POST /api/organization/custom-fields/definitions
   */
  @Post('definitions')
  async create(
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(createDefinitionSchema))
    body: CreateDefinitionDto,
  ) {
    return await this.definitionsService.create(organization.id, {
      ...body,
      createdBy: session.user.id,
    });
  }

  /**
   * Delete a field definition (soft delete)
   * DELETE /api/organization/custom-fields/definitions/:id
   */
  @Delete('definitions/:id')
  async delete(
    @ActiveOrganization() organization: Organization,
    @Param('id') id: string,
  ) {
    try {
      await this.definitionsService.delete(organization.id, id);
      return { success: true };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Field definition not found')
      ) {
        throw new NotFoundException('Field definition not found');
      }
      throw error;
    }
  }

  /**
   * Get a single field definition by ID
   * GET /api/organization/custom-fields/definitions/:id
   */
  @Get('definitions/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const definition = await this.definitionsService.getById(
      organization.id,
      id,
    );

    if (!definition) {
      throw new NotFoundException('Field definition not found');
    }

    return definition;
  }

  /**
   * List all field definitions for an entity type
   * GET /api/organization/custom-fields/definitions?entityType=org_contact
   */
  @Get('definitions')
  async list(
    @ActiveOrganization() organization: Organization,
    @Query('entityType') entityType: string,
  ) {
    if (!entityType) {
      return [];
    }
    return await this.definitionsService.getByEntityType(
      organization.id,
      entityType,
    );
  }

  /**
   * Update a field definition
   * PATCH /api/organization/custom-fields/definitions/:id
   */
  @Patch('definitions/:id')
  async update(
    @ActiveOrganization() organization: Organization,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateDefinitionSchema))
    body: UpdateDefinitionDto,
  ) {
    try {
      return await this.definitionsService.update(organization.id, id, body);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Field definition not found')
      ) {
        throw new NotFoundException('Field definition not found');
      }
      throw error;
    }
  }
}
