import { Injectable } from '@nestjs/common';
import {
  type CustomFieldDefinition,
  type ValidationRules,
} from '@repo/database/schema';
import { z } from 'zod';

import { CustomFieldDefinitionsService } from './custom-field-definitions.service';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
  normalized: Record<string, unknown>;
}

@Injectable()
export class CustomFieldValidationService {
  constructor(
    private readonly definitionsService: CustomFieldDefinitionsService,
  ) {}

  /**
   * Check if key is reserved
   */
  isReservedKey(key: string): boolean {
    return key.startsWith('_');
  }

  /**
   * Main validation entry point - validates custom fields against definitions
   * @param organizationId The organization ID
   * @param entityType The entity type (e.g., 'org_contact', 'org_account')
   * @param customFields The custom fields to validate
   * @returns ValidationResult with success status, errors, and normalized values
   */
  async validateCustomFields(
    organizationId: string,
    entityType: string,
    customFields: Record<string, unknown>,
  ): Promise<ValidationResult> {
    // Fetch definitions for this entity type
    const definitions = await this.definitionsService.getByEntityType(
      organizationId,
      entityType,
    );

    const errors: ValidationError[] = [];
    const normalized: Record<string, unknown> = {};
    const allowedKeys = new Set(definitions.map((d) => d.key));

    // Check for unknown keys (strict mode)
    for (const key of Object.keys(customFields)) {
      if (!allowedKeys.has(key) && !key.startsWith('_')) {
        errors.push({
          field: key,
          message: `Unknown field key '${key}'. Keys must be defined in custom field definitions.`,
        });
      }
    }

    // Validate each field
    for (const definition of definitions) {
      const value = customFields[definition.key];

      try {
        const validated = await this.validateField(definition, value);
        normalized[definition.key] = validated;
      } catch (error) {
        errors.push({
          field: definition.key,
          message: error instanceof Error ? error.message : 'Validation failed',
        });
      }

      // Check required fields
      if (definition.isRequired && (value === undefined || value === null)) {
        errors.push({
          field: definition.key,
          message: 'This field is required',
        });
      }
    }

    return {
      success: errors.length === 0,
      errors,
      normalized,
    };
  }

  /**
   * Validate key format
   */
  validateKeyFormat(key: string): boolean {
    // Alphanumeric, underscores, hyphens, max 50 chars
    return /^[a-zA-Z0-9_-]{1,50}$/.test(key) && !key.startsWith('_');
  }

  /**
   * Apply additional validation rules from the validation JSONB field
   */
  private applyValidationRules(
    schema: z.ZodTypeAny,
    validation: ValidationRules,
  ): z.ZodTypeAny {
    if (validation.min !== undefined && schema instanceof z.ZodNumber) {
      schema = schema.min(validation.min);
    }
    if (validation.max !== undefined && schema instanceof z.ZodNumber) {
      schema = schema.max(validation.max);
    }
    if (validation.minLength !== undefined && schema instanceof z.ZodString) {
      schema = schema.min(validation.minLength);
    }
    if (validation.maxLength !== undefined && schema instanceof z.ZodString) {
      schema = schema.max(validation.maxLength);
    }
    if (validation.pattern !== undefined && schema instanceof z.ZodString) {
      schema = schema.regex(new RegExp(validation.pattern));
    }
    return schema;
  }

  /**
   * Create Zod schema for a field based on its type
   */
  private createFieldSchema(definition: CustomFieldDefinition): z.ZodTypeAny {
    let schema: z.ZodTypeAny;

    switch (definition.fieldType) {
      case 'string':
        schema = z.string();
        break;

      case 'number':
        schema = z.number();
        break;

      case 'boolean':
        schema = z.boolean();
        break;

      case 'date':
        schema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
          message: 'Invalid date format. Use YYYY-MM-DD',
        });
        break;

      case 'datetime':
        schema = z.string().datetime({
          message: 'Invalid datetime format. Use ISO 8601',
        });
        break;

      case 'single_select': {
        const singleChoices = this.extractChoiceValues(definition.choices);
        if (singleChoices.length === 0) {
          throw new Error('No choices defined for single_select field');
        }
        schema = z.enum(singleChoices as [string, ...string[]]);
        break;
      }

      case 'multi_select': {
        const multiChoices = this.extractChoiceValues(definition.choices);
        if (multiChoices.length === 0) {
          throw new Error('No choices defined for multi_select field');
        }
        schema = z.array(z.enum(multiChoices as [string, ...string[]]));
        break;
      }

      case 'json':
        schema = z.union([z.object({}), z.array(z.any())]);
        break;

      case 'reference':
        schema = z.uuid();
        break;

      default:
        schema = z.any();
    }

    // Apply custom validation rules
    if (definition.validation) {
      schema = this.applyValidationRules(schema, definition.validation);
    }

    // Make optional if not required
    if (!definition.isRequired) {
      schema = schema.optional().nullable();
    }

    return schema;
  }

  /**
   * Helper to extract choice values from choices array
   */
  private extractChoiceValues(
    choices: Array<{ label: string; value: string }> | null,
  ): string[] {
    if (!choices) return [];
    return choices.map((c) => c.value);
  }

  /**
   * Validate a single field against its definition
   */
  private async validateField(
    definition: CustomFieldDefinition,
    value: unknown,
  ): Promise<unknown> {
    const schema = this.createFieldSchema(definition);
    return await schema.parseAsync(value);
  }
}
