import { ConflictException, Injectable } from '@nestjs/common';

import { DatabaseErrorService } from './error';

type PgError = {
  code?: string;
  detail?: string;
  constraint?: string;
  constraint_name?: string;
  column?: string;
  column_name?: string;
  message?: string;
  cause?: unknown;
};

@Injectable()
export class DrizzleErrorService {
  private readonly databaseErrorService: DatabaseErrorService;

  constructor(databaseErrorService: DatabaseErrorService) {
    this.databaseErrorService = databaseErrorService;
  }

  formatDrizzleError(err: unknown): string {
    if (!this.isRecord(err)) {
      return 'An unknown database error occurred.';
    }

    const pgError = this.extractOriginalPgError(err);

    const code = pgError?.code;
    const detail = pgError?.detail ?? '';
    const constraint = pgError?.constraint ?? pgError?.constraint_name ?? '';
    const column = pgError?.column ?? pgError?.column_name ?? '';
    const rawMsg = pgError?.message ?? '';

    switch (code) {
      case '23505': // unique_violation
        return `Duplicate value error: ${this.parseConstraint(constraint) || detail || 'a unique field already exists.'}`;

      case '23503': // foreign_key_violation
        return `Foreign key violation: ${this.parseConstraint(constraint) || detail || 'referenced record not found.'}`;

      case '23502': // not_null_violation
        return `Missing required field: ${column || this.parseColumnFromMessage(rawMsg) || 'a required field was missing.'}`;

      case '22P02': // invalid_text_representation
        return `Invalid data format: ${detail || 'Check input types and formats.'}`;

      default:
        return `Database error${code ? ` [${code}]` : ''}: ${this.stripQuery(rawMsg) || 'Unexpected database error.'}`;
    }
  }

  handleDrizzleError(error: unknown): never {
    const message = this.formatDrizzleError(error);

    if (this.isForeignKeyConstraintError(error)) {
      throw new ConflictException(message);
    }

    throw this.databaseErrorService.internalServerError(message);
  }

  isDatabaseError(error: unknown): boolean {
    return typeof this.getErrorCode(error) === 'string';
  }

  withErrorHandling<TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => Promise<TResult>,
  ): (...args: TArgs) => Promise<TResult> {
    return async (...args: TArgs): Promise<TResult> => {
      try {
        return await fn(...args);
      } catch (err: unknown) {
        this.handleDrizzleError(err);
      }
    };
  }

  private extractOriginalPgError(err: unknown): PgError | undefined {
    if (!this.isRecord(err)) return;

    if ('cause' in err && this.isRecord(err.cause)) {
      return this.extractOriginalPgError(err.cause);
    }

    return err as PgError;
  }

  private getErrorCode(error: unknown): string | undefined {
    if (!this.isRecord(error)) return;

    const code = error.code;
    if (typeof code === 'string') return code;

    if ('cause' in error) {
      return this.getErrorCode(error.cause);
    }

    return;
  }

  private isForeignKeyConstraintError(error: unknown) {
    return this.getErrorCode(error) === '23503';
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private parseColumnFromMessage(msg: string): string | null {
    const match = msg.match(/null value in column "(.*?)"/);
    return match?.[1] ?? null;
  }

  private parseConstraint(constraint: string): string {
    if (!constraint) return 'A database constraint was violated.';

    const fieldMatch = constraint.match(/_(\w+?)(?:_key|_idx|_fkey)?$/);
    const field = fieldMatch?.[1];
    const prettyField = field
      ? this.toTitleCase(field.replace(/_/g, ' '))
      : null;

    if (constraint.includes('_key'))
      return `${prettyField ?? constraint} must be unique.`;
    if (constraint.includes('_fkey'))
      return `${prettyField ?? constraint} must reference a valid record.`;

    return `Constraint violation on ${prettyField ?? constraint}.`;
  }

  private stripQuery(msg: string): string {
    if (!msg) return '';

    const firstLine = msg.split('\n')[0] ?? '';

    return firstLine.replace(/^Failed query:\s*/, '').trim();
  }

  private toTitleCase(str: string): string {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
