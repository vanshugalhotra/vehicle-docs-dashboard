import { EXPORT_CONFIGS, ExportType, ExportField } from './export.config';

/**
 * Safe resolver supporting nested keys: a.b.c
 */
const resolveNestedValue = <T extends object>(
  obj: T,
  path: string,
): unknown => {
  if (!path || !obj) return undefined;

  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
};

/**
 * Maps a database row to export output object based on ExportField rules
 */
export const mapRowForExport = <TRow extends object>(
  row: TRow,
  fields: ExportField<TRow>[],
): Record<string, unknown> => {
  const output: Record<string, unknown> = {};

  for (const field of fields) {
    const rawValue = resolveNestedValue(row, field.key);

    const value = field.transform ? field.transform(rawValue, row) : rawValue;

    output[field.title] = value ?? '';
  }

  return output;
};

/**
 * Maps entire dataset for given ExportType
 */
export const mapExportData = <TRow extends object>(
  type: ExportType,
  data: TRow[],
) => {
  const config = EXPORT_CONFIGS[type];
  return data.map((row) => mapRowForExport(row, config.fields));
};

/**
 * Helper to get filename + mapped data together
 */
export const prepareExportPayload = <TRow extends object>(
  type: ExportType,
  data: TRow[],
) => {
  const config = EXPORT_CONFIGS[type];

  return {
    filename: config.filename,
    sheetName: config.sheetName,
    records: mapExportData(type, data),
  };
};
