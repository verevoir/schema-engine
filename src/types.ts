import type { z } from 'zod';

/** UI hint telling an editor what control to render */
export type UIHint =
  | 'text'
  | 'rich-text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'array'
  | 'object';

/** Metadata attached to a field */
export interface FieldMeta {
  label: string;
  ui: UIHint;
  required: boolean;
}

/** A field definition: Zod schema + metadata */
export interface FieldDefinition<T extends z.ZodTypeAny = z.ZodTypeAny> {
  schema: T;
  meta: FieldMeta;
}

/** A record of field definitions keyed by field name */
export type FieldRecord = Record<string, FieldDefinition>;

/** A block definition returned by defineBlock() */
export interface BlockDefinition<F extends FieldRecord> {
  name: string;
  fields: F;
  schema: z.ZodObject<{
    [K in keyof F]: F[K]['schema'];
  }>;
  validate: (
    data: unknown,
  ) => z.infer<z.ZodObject<{ [K in keyof F]: F[K]['schema'] }>>;
}

/** Infer the TypeScript type from a block definition */
export type InferBlock<B> =
  B extends BlockDefinition<infer F>
    ? z.infer<z.ZodObject<{ [K in keyof F]: F[K]['schema'] }>>
    : never;
