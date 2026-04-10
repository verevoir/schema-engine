import { z } from 'zod';
import { Field, StringField, NumberField, ReferenceField } from './metadata.js';
import type { FieldDefinition } from './types.js';

/** Single-line text field */
export function text(label: string): StringField {
  return new StringField(z.string(), { label, ui: 'text', required: true });
}

/** Rich text field (storage format is a string — HTML, JSON, etc.) */
export function richText(label: string): StringField {
  return new StringField(z.string(), {
    label,
    ui: 'rich-text',
    required: true,
  });
}

/** Number field */
export function number(label: string): NumberField {
  return new NumberField(z.number(), {
    label,
    ui: 'number',
    required: true,
  });
}

/** Boolean field (toggle / checkbox) */
export function boolean(label: string): Field<z.ZodBoolean> {
  return new Field(z.boolean(), { label, ui: 'boolean', required: true });
}

/** Select field (dropdown from a fixed set of options) */
export function select<const T extends readonly [string, ...string[]]>(
  label: string,
  options: T,
) {
  return new Field(z.enum(options), { label, ui: 'select', required: true });
}

/** Reference field (stores a UUID string pointing to a document of the given block type) */
export function reference(
  label: string,
  targetBlockType: string,
): ReferenceField {
  return new ReferenceField(z.string().uuid(), {
    label,
    ui: 'reference',
    required: true,
    targetBlockType,
  });
}

/** Array field (list of items). Pass a field definition as the item template. */
export function array<T extends z.ZodTypeAny>(
  label: string,
  item: FieldDefinition<T>,
): Field<z.ZodArray<T>> {
  return new Field(z.array(item.schema), {
    label,
    ui: 'array',
    required: true,
    itemMeta: item.meta,
  });
}

/** Object field (nested group of fields). Pass a record of field definitions as the shape. */
export function object<T extends Record<string, FieldDefinition>>(
  label: string,
  fields: T,
): Field<z.ZodObject<{ [K in keyof T]: T[K]['schema'] }>> {
  const shape = Object.fromEntries(
    Object.entries(fields).map(([key, field]) => [key, field.schema]),
  ) as { [K in keyof T]: T[K]['schema'] };

  return new Field(z.object(shape), {
    label,
    ui: 'object',
    required: true,
    // Preserve the original FieldRecord so editors can introspect
    // the nested shape (labels, hints, UI hints) for richer rendering
    // — e.g. picking column headers for a table view inside an array.
    objectFields: fields,
  });
}
