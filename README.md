# @verevoir/schema

Define content shapes in TypeScript. Get validation, type inference, and UI metadata from a single definition. Built on [Zod](https://zod.dev), standalone, UI-framework-agnostic.

```bash
npm install @verevoir/schema
```

One definition, three artefacts:

```typescript
import { defineBlock, text, richText, number, boolean } from '@verevoir/schema';

const hero = defineBlock({
  name: 'hero',
  fields: {
    title: text('Title').max(60),
    body: richText('Body'),
    order: number('Sort Order').optional(),
    featured: boolean('Featured'),
  },
});

// 1. Validate unknown data — throws a ZodError on failure
const validated = hero.validate(rawData);

// 2. TypeScript type, inferred
type Hero = InferBlock<typeof hero>;

// 3. UI metadata for editors (labels, hints, required flags, UI hints)
hero.fields.title.meta.label; // → 'Title'
hero.fields.title.meta.hint; // → undefined; add one with .hint('...')
```

No editor dependency; no storage dependency. The schema engine is consumed by those things, not the other way round. A consumer that just wants to validate JSON stops here.

## Field factories

| Factory                                  | Stored as       | Editor control                                    |
| ---------------------------------------- | --------------- | ------------------------------------------------- |
| `text(label)`                            | string          | single-line input                                 |
| `richText(label)`                        | string          | rich-text / markdown surface                      |
| `datetime(label)`                        | ISO-8601 string | natural-language datetime input (via the editor)  |
| `number(label)`                          | number          | number input                                      |
| `boolean(label)`                         | boolean         | toggle                                            |
| `select(label, [...options])`            | string (enum)   | dropdown                                          |
| `reference(label, targetBlockType)`      | UUID string     | reference picker                                  |
| `link(label)`                            | string          | link field (internal-or-external, auto-detected)  |
| `array(label, item)`                     | array           | list — chips / table / cards / drilldown         |
| `object(label, fields)`                  | nested object   | nested fieldset                                   |

Every factory returns a `Field<T>` that wraps a Zod schema and carries metadata. Chain `.optional()`, `.default(value)`, `.hint('...')`, `.display('cards')` to customise. Call `field.schema` to get the raw Zod schema for use anywhere Zod works.

## `defineBlock` vs `defineContentBlock`

`defineBlock` groups any set of fields into a named block. `defineContentBlock` does the same but also injects the conventional document-metadata fields (`title`, `slug`, `metaTitle`, `metaDescription`, `addTitleSuffix`) — the SEO essentials every public content document tends to carry:

```typescript
import { defineContentBlock, richText } from '@verevoir/schema';

const article = defineContentBlock({
  name: 'article',
  fields: {
    body: richText('Body'),
    // title, slug, metaTitle, metaDescription, addTitleSuffix already added
  },
});
```

The injected fields carry an `isMeta: true` marker. Admin UIs can use the marker to bucket them separately from author-defined fields — e.g. into a dedicated metadata column.

## The `.hint()` method

Every field supports a free-text directive:

```typescript
slug: text('Slug').hint('URL path. Use `/` for the home page, lowercase hyphenated otherwise.');
```

Editors surface hints as help text. AI-assisted content tools use them as copy-generation directives. Doc generators include them in rendered field descriptions. One sentence, three audiences.

## Design decisions

- **Zod is the schema, not a form language.** UI hints are metadata layered on top. You can extract the raw Zod schema and use it anywhere Zod works.
- **UI hints tell editors what to render**, but the schema engine doesn't know anything about editors. Swap editors without touching schemas.
- **Immutable chaining.** Every chained call (`.optional()`, `.hint(...)`, etc.) returns a new Field — safe to compose.
- **One runtime dependency: Zod.** No framework lock-in.

## Where it sits

`@verevoir/schema` is the foundation layer. Things that build on it:

- **[@verevoir/storage](https://www.npmjs.com/package/@verevoir/storage)** — persistence against a pluggable adapter interface
- **[@verevoir/editor](https://www.npmjs.com/package/@verevoir/editor)** — auto-generated React forms from block definitions; ships augmentation helpers (`publishFields()`, `tagsField()`, `isLive()`) that inject conventional fields into any block
- **[@verevoir/admin](https://www.npmjs.com/package/@verevoir/admin)** — composable admin shell that consumes the block registry

Each layer is optional. Use schema + storage for a headless content lake. Add editor for a CMS. Add admin for the full experience.

## See it in a real app

The [Verevoir starter](https://github.com/verevoir/astro-sanity-starter) is a working Astro site using schema, storage, editor, and admin end-to-end.

## Docs

- [Defining content models](https://verevoir.io/docs/defining-content-models)
- [Integration guide](https://verevoir.io/docs/integration)

## License

MIT
