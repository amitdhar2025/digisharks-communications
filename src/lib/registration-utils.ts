/**
 * Shared utility functions for the registration form system.
 */

/* ── Field Normalization ───────────────────────────────── */

/**
 * Ensure type-specific default properties are always present on each field.
 * Mongoose `.lean()` may strip empty-string defaults, so this guarantees
 * all expected properties exist before save or render.
 *
 * NOTE: These defaults mirror the FormFieldSchema in RegistrationFormConfig.js.
 * If a new optional field is added to the Mongoose schema, add it here too.
 */
export function normalizeFieldDefaults<T extends Record<string, any>>(field: T): T {
  const base: Record<string, any> = {
    htmlContent: '',
    imageSrc: '',
    imageAlt: '',
    imageHeight: 'auto',
    imageBorderRadius: '8',
    customWidth: '',
    marginTop: 'none',
    marginBottom: 'none',
    paddingTop: 'none',
    paddingBottom: 'none',
    backgroundColor: '',
    borderColor: '',
    borderWidth: 'none',
    borderRadius: 'none',
    textAlign: 'left',
    dividerStyle: 'solid',
    dividerColor: '#e2e8f0',
    dividerThickness: '1',
    separatorHeight: '24',
    height: 'auto',
    pattern: '',
    errorMessage: '',
    helpText: '',
    columnGap: '16',
    columns: 2,
    childKeys: [],
  }
  const out: Record<string, any> = { ...field }
  for (const [k, v] of Object.entries(base)) {
    if (out[k] === undefined || out[k] === null) out[k] = v
  }
  return out as T
}

/**
 * Normalize an array of fields, ensuring all type-specific defaults.
 */
export function normalizeFields<T extends Record<string, any>>(fields: T[]): T[] {
  return fields.map(normalizeFieldDefaults)
}

/**
 * Generate a URL-safe slug from a name string.
 * Falls back to 'form-{timestamp}' if the result would be empty.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'form-' + Date.now()
}

/**
 * Ensure all fields have valid numeric order values.
 * Fields with missing, undefined, or NaN order get sequential values
 * continuing from the highest existing order.
 *
 * @returns Object with the fixed fields array and a count of fixes applied.
 */
export function ensureValidOrders<T extends { order?: number }>(
  fields: T[]
): { fields: T[]; fixedCount: number } {
  let maxOrder = 0
  for (const field of fields) {
    if (typeof field.order === 'number' && !isNaN(field.order) && field.order > maxOrder) {
      maxOrder = field.order
    }
  }

  let fixedCount = 0
  const result = fields.map((field) => {
    if (typeof field.order !== 'number' || isNaN(field.order)) {
      maxOrder++
      fixedCount++
      return { ...field, order: maxOrder }
    }
    return field
  })

  return { fields: result, fixedCount }
}
