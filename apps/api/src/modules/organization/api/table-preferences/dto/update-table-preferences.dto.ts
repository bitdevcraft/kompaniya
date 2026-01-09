import type { ColumnVisibilityState } from '@repo/database/schema';

export type UpdateTablePreferencesDto = {
  visibility: ColumnVisibilityState;
};
