import type { z } from 'zod';

/** UI hint telling an editor what control to render */
export type UIHint =
  | 'text'
  | 'rich-text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'array'
  | 'object'
  | 'reference';

/** Metadata attached to a field */
export interface FieldMeta {
  label: string;
  ui: UIHint;
  required: boolean;
  /** For reference fields: the block type this reference points to */
  targetBlockType?: string;
  /** For array fields: the metadata of the item field (e.g. array of references) */
  itemMeta?: FieldMeta;
}

/** A field definition: Zod schema + metadata */
export interface FieldDefinition<T extends z.ZodTypeAny = z.ZodTypeAny> {
  schema: T;
  meta: FieldMeta;
}

/** A record of field definitions keyed by field name */
export type FieldRecord = Record<string, FieldDefinition>;

/** A named content block with its field definitions, Zod schema, and a validate function. */
export interface BlockDefinition<F extends FieldRecord> {
  name: string;
  fields: F;
  /** The composed Zod object schema — can be used directly with `schema.parse()` or `schema.safeParse()`. */
  schema: z.ZodObject<{
    [K in keyof F]: F[K]['schema'];
  }>;
  /** Parse and validate unknown data. Returns the typed result on success, throws a ZodError on failure. */
  validate: (
    data: unknown,
  ) => z.infer<z.ZodObject<{ [K in keyof F]: F[K]['schema'] }>>;
}

/** Extract the TypeScript type a block would produce after validation. Usage: `type Hero = InferBlock<typeof hero>` */
export type InferBlock<B> =
  B extends BlockDefinition<infer F>
    ? z.infer<z.ZodObject<{ [K in keyof F]: F[K]['schema'] }>>
    : never;
