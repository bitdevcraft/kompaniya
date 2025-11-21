import type { CsvImportColumn } from '../csv-import.types';

export const ORG_REAL_ESTATE_PROPERTIES_COLUMNS: CsvImportColumn[] = [
  {
    key: 'id',
    label: 'ID',
    type: 'string',
    description:
      'Provide an existing ID to update a record. Leave empty to create a new record.',
  },
  { key: 'name', label: 'Name', type: 'string' },
];
