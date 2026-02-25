import { z } from 'zod';
import { Field, StringField, NumberField } from './metadata.js';
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
export function select<T extends [string, ...string[]]>(
  label: string,
  options: T,
): Field<z.ZodEnum<T>> {
  return new Field(z.enum(options), { label, ui: 'select', required: true });
}

/** Array field (list of items) */
export function array<T extends z.ZodTypeAny>(
  label: string,
  item: FieldDefinition<T>,
): Field<z.ZodArray<T>> {
  return new Field(z.array(item.schema), {
    label,
    ui: 'array',
    required: true,
  });
}

/** Object field (nested group of fields) */
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
  });
}
