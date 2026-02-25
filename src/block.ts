import { z } from 'zod';
import type { FieldRecord, BlockDefinition } from './types.js';

/**
 * Define a named content block from a set of fields.
 * Composes field schemas into a Zod object schema. The returned `validate`
 * method calls `schema.parse()` — it throws a `ZodError` on invalid data.
 */
export function defineBlock<F extends FieldRecord>(config: {
  name: string;
  fields: F;
}): BlockDefinition<F> {
  const shape = Object.fromEntries(
    Object.entries(config.fields).map(([key, field]) => [key, field.schema]),
  ) as { [K in keyof F]: F[K]['schema'] };

  const schema = z.object(shape);

  return {
    name: config.name,
    fields: config.fields,
    schema,
    validate: (data: unknown) => schema.parse(data),
  };
}
