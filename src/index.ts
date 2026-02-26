// Field types
export {
  text,
  richText,
  number,
  boolean,
  select,
  array,
  object,
  reference,
} from './fields.js';

// Block definition
export { defineBlock } from './block.js';

// Metadata classes (for advanced use / extending)
export { Field, StringField, NumberField, ReferenceField } from './metadata.js';

// Types
export type {
  UIHint,
  FieldMeta,
  FieldDefinition,
  FieldRecord,
  BlockDefinition,
  InferBlock,
} from './types.js';
