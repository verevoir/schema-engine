import { z } from 'zod';
import type { FieldRecord, BlockDefinition, FieldDefinition } from './types.js';
import { Field, StringField } from './metadata.js';
import { text, boolean } from './fields.js';

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

/**
 * Marks a field as conventional document metadata. Used internally
 * by `defineContentBlock` to flag the title/slug/SEO fields it
 * injects, but also exported so consumers can opt-in a custom field
 * (e.g. an extra "canonicalUrl" override) into the metadata column
 * of the admin's Document tab.
 */
export function meta<F extends FieldDefinition>(field: F): F {
  // Field instances are immutable wrappers around their Zod schema —
  // mutate the meta object directly so chained `.optional()` etc.
  // calls preserve the marker without us needing to clone the
  // entire Field subclass hierarchy here.
  const next = { ...field, meta: { ...field.meta, isMeta: true } };
  // Restore the prototype chain so any subclass methods (StringField.max,
  // NumberField.int, etc.) keep working on the returned value.
  Object.setPrototypeOf(next, Object.getPrototypeOf(field));
  return next as F;
}

/**
 * The set of meta fields every "content document" carries — title,
 * slug, SEO bits. They are not configurable: by definition, a
 * content document IS a thing that has these fields. Block authors
 * who use `defineContentBlock` get them automatically.
 *
 * The shape is:
 * - `title`: required string
 * - `slug`: required string (e.g. `/about`)
 * - `metaTitle`: optional string — overrides `title` for `<title>`
 * - `metaDescription`: optional string — page meta description
 * - `addTitleSuffix`: boolean — append the site title suffix
 */
export interface ContentMetaFields {
  title: StringField;
  slug: StringField;
  metaTitle: ReturnType<StringField['optional']>;
  metaDescription: ReturnType<StringField['optional']>;
  addTitleSuffix: ReturnType<Field<z.ZodBoolean>['default']>;
}

function buildContentMetaFields(): ContentMetaFields {
  return {
    title: meta(text('Title')),
    slug: meta(text('Slug').hint('e.g. /about')),
    metaTitle: meta(
      text('Meta Title')
        .hint('Overrides the page title for browser tabs and search engines.')
        .optional(),
    ),
    metaDescription: meta(
      text('Meta Description')
        .hint(
          'Short summary shown in search results and social previews. Aim for 150 characters.',
        )
        .optional(),
    ),
    addTitleSuffix: meta(boolean('Append site title suffix').default(true)),
  };
}

/**
 * Define a content block — a `defineBlock` variant that injects
 * the universal document metadata fields (title, slug, SEO) on
 * top of whatever the author defines. The injected fields carry
 * `isMeta: true` so the admin can route them into the metadata
 * column of the Document tab.
 *
 * The author's own field names are merged on top of the meta
 * fields, so a custom block CAN technically replace one (e.g.
 * provide a stronger `slug` validator) but should not normally
 * need to.
 */
export function defineContentBlock<F extends FieldRecord>(config: {
  name: string;
  fields: F;
}): BlockDefinition<ContentMetaFields & F & FieldRecord> {
  // The merged shape inherits an index signature from FieldRecord
  // so the result is assignable to BlockDefinition<FieldRecord>
  // — required by BlockRegistry in @verevoir/admin, which keys
  // blocks by their type discriminator and can't carry the
  // ContentMetaFields shape forward through that map.
  const merged = {
    ...buildContentMetaFields(),
    ...config.fields,
  } as ContentMetaFields & F & FieldRecord;

  return defineBlock({
    name: config.name,
    fields: merged,
  });
}
