import type { CsvImportColumn } from '../csv-import.types';

export const ORG_LEADS_COLUMNS: CsvImportColumn[] = [
  {
    key: 'id',
    label: 'ID',
    type: 'string',
    description:
      'Provide an existing ID to update a record. Leave empty to create a new record.',
  },
  { key: 'firstName', label: 'First Name', type: 'string' },
  { key: 'lastName', label: 'Last Name', type: 'string' },
  { key: 'salutation', label: 'Salutation', type: 'string' },
  { key: 'name', label: 'Full Name', type: 'string' },
  { key: 'phone', label: 'Phone', type: 'string' },
  { key: 'phoneE164', label: 'Phone (E164)', type: 'string' },
  { key: 'email', label: 'Email', type: 'string' },
  { key: 'emailNormalized', label: 'Email (Normalized)', type: 'string' },
  { key: 'nationality', label: 'Nationality', type: 'string' },
  {
    key: 'tags',
    label: 'Tags',
    type: 'string[]',
    description: 'Comma separated values will be stored as tags array.',
  },
  {
    key: 'categories',
    label: 'Categories',
    type: 'string[]',
    description: 'Comma separated values will be stored as categories array.',
  },
  { key: 'notes', label: 'Notes', type: 'string' },
  { key: 'lastActivityAt', label: 'Last Activity At', type: 'date' },
  { key: 'nextActivityAt', label: 'Next Activity At', type: 'date' },
  { key: 'score', label: 'Score', type: 'number' },
];
