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
  /**
   * For object fields: the original FieldRecord that defined the
   * object's shape. Preserved (along with each child field's metadata)
   * so editors can introspect the structure — e.g. to render an
   * editable table for an array of small objects without losing
   * column labels, hints, or UI hints.
   */
  objectFields?: FieldRecord;
  /** Natural-language directive for AI-assisted content generation (e.g. "Write in third person, 2-3 sentences") */
  hint?: string;
  /**
   * Optional renderer hint for editors. Lets the schema author
   * override automatic UI selection (e.g. force an array of small
   * objects to render as a card grid instead of an inline table).
   * Editors that don't recognise the value should fall back to
   * their default behaviour.
   */
  display?: string;
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
