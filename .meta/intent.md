# Intent — @nextlake/schema

## Purpose

Let developers define structured content shapes in TypeScript and get validation, type inference, and UI hints from a single definition. The schema engine is the foundation package — everything else in NextLake builds on it.

## Goals

- Single source of truth for content shape: validation rules, TypeScript types, and editor hints come from one definition
- Fluent, discoverable API — field chaining (`.max()`, `.optional()`, `.default()`) feels natural to TypeScript developers
- Zero UI dependency — the schema engine is consumed by editors and storage, never the reverse
- Minimal runtime footprint — Zod is the only dependency

## Non-goals

- Render UI — that is the editor's job; the schema engine only provides hints
- Persist data — that is the storage adapter's job
- Replace Zod — the schema engine layers metadata on top of Zod, it does not wrap or hide it
- Be a form definition language — Zod schemas are the source of truth, UI hints are metadata

## Key design decisions

- **Zod as the schema layer.** Zod provides validation, parsing, and TypeScript inference out of the box. Rather than building a custom validator, we layer UI metadata on top of Zod and let developers extract raw Zod schemas for use anywhere Zod works.
- **Field chaining API.** Methods like `.max(60)` and `.optional()` mirror Zod's own refinement style, keeping the mental model consistent and reducing API surface.
- **UIHints, not components.** Fields declare _what kind_ of control they need (e.g. `text`, `richText`, `select`), not _which_ component to render. This keeps the schema engine framework-agnostic.
- **`defineBlock` as the unit of content.** A block groups related fields under a name. This maps cleanly to documents, components, or any other unit of structured content.

## Constraints

- Single runtime dependency: `zod`
- No framework imports (React, Vue, etc.) — ever
- Every field function must return a standard Zod schema that works outside NextLake
