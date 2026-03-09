# @verevoir/schema

A lightweight TypeScript library for defining structured content shapes. Built on [Zod](https://zod.dev) with UI metadata extensions.

## What It Does

- Define content blocks as TypeScript code using Zod schemas
- Get validation, type inference, and UI hints from a single definition
- No UI framework dependency — the schema engine is consumed by editor components, not the other way around
- Single runtime dependency: `zod`

## Install

```bash
npm install @verevoir/schema
```

## Quick Example

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

// Validate unknown data
const result = hero.validate(someData);

// TypeScript type
type Hero = InferBlock<typeof hero>;
```

## Architecture

| File              | Responsibility                                                                   |
| ----------------- | -------------------------------------------------------------------------------- |
| `src/metadata.ts` | Field wrapper class that pairs a Zod schema with UI metadata                     |
| `src/fields.ts`   | Field factory functions (text, richText, number, boolean, select, array, object) |
| `src/block.ts`    | `defineBlock()` groups fields into a named content block                         |
| `src/types.ts`    | TypeScript type definitions (InferBlock, FieldMeta, etc.)                        |
| `src/index.ts`    | Public API exports                                                               |

## Design Decisions

- **Zod is the schema, not a form definition language.** UI hints are metadata layered on top.
- **Every field function returns a standard Zod schema** — you can extract it and use it anywhere Zod works.
- **The `.ui` hint tells an editor what control to render**, but the schema engine doesn't know about editors.

## Documentation

- [Defining Content Models](https://verevoir.io/docs/defining-content-models) — blocks, fields, validation, and type inference
- [Getting Started](https://verevoir.io/docs/getting-started) — content model, storage, and editor in five minutes
- [Integration Guide](https://verevoir.io/docs/integration) — connecting content models, storage, editor, and more

## Development

```bash
npm install    # Install dependencies
make build     # Compile TypeScript
make test      # Run test suite
make lint      # Check formatting
```
