import { z } from "zod";
import type { FieldDefinition, FieldMeta, UIHint } from "./types.js";

/**
 * Wraps a Zod schema with UI metadata. Provides chainable methods
 * that delegate to Zod while preserving the metadata.
 */
export class Field<T extends z.ZodTypeAny = z.ZodTypeAny>
  implements FieldDefinition<T>
{
  constructor(
    public readonly schema: T,
    public readonly meta: FieldMeta,
  ) {}

  /** Mark this field as optional */
  optional(): Field<z.ZodOptional<T>> {
    return new Field(this.schema.optional(), {
      ...this.meta,
      required: false,
    });
  }

  /** Set a default value */
  default<D extends z.input<T>>(value: D): Field<z.ZodDefault<T>> {
    return new Field(this.schema.default(value), {
      ...this.meta,
      required: false,
    });
  }
}

/** Field subclass for string-based fields with string-specific chainable methods */
export class StringField extends Field<z.ZodString> {
  /** Set maximum length */
  max(length: number): StringField {
    return new StringField(this.schema.max(length), this.meta);
  }

  /** Set minimum length */
  min(length: number): StringField {
    return new StringField(this.schema.min(length), this.meta);
  }

  /** Apply a regex pattern */
  regex(pattern: RegExp): StringField {
    return new StringField(this.schema.regex(pattern), this.meta);
  }
}

/** Field subclass for number-based fields with number-specific chainable methods */
export class NumberField extends Field<z.ZodNumber> {
  /** Set maximum value */
  max(value: number): NumberField {
    return new NumberField(this.schema.max(value), this.meta);
  }

  /** Set minimum value */
  min(value: number): NumberField {
    return new NumberField(this.schema.min(value), this.meta);
  }

  /** Restrict to integers */
  int(): NumberField {
    return new NumberField(this.schema.int(), this.meta);
  }
}
