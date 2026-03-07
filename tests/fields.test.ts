import { describe, it, expect } from 'vitest';
import {
  text,
  richText,
  number,
  boolean,
  select,
  array,
  object,
  reference,
  ReferenceField,
} from '../src/index.js';

describe('text()', () => {
  it('creates a string field with text UI hint', () => {
    const field = text('Title');
    expect(field.meta.label).toBe('Title');
    expect(field.meta.ui).toBe('text');
    expect(field.meta.required).toBe(true);
  });

  it('validates strings', () => {
    const field = text('Title');
    expect(field.schema.parse('hello')).toBe('hello');
    expect(() => field.schema.parse(123)).toThrow();
  });

  it('supports .max()', () => {
    const field = text('Title').max(5);
    expect(field.schema.parse('hello')).toBe('hello');
    expect(() => field.schema.parse('too long')).toThrow();
  });

  it('supports .min()', () => {
    const field = text('Title').min(3);
    expect(field.schema.parse('hello')).toBe('hello');
    expect(() => field.schema.parse('hi')).toThrow();
  });

  it('supports .optional()', () => {
    const field = text('Title').optional();
    expect(field.meta.required).toBe(false);
    expect(field.schema.parse(undefined)).toBeUndefined();
    expect(field.schema.parse('hello')).toBe('hello');
  });
});

describe('richText()', () => {
  it('creates a string field with rich-text UI hint', () => {
    const field = richText('Body');
    expect(field.meta.ui).toBe('rich-text');
    expect(field.schema.parse('<p>hello</p>')).toBe('<p>hello</p>');
  });
});

describe('.hint()', () => {
  it('attaches a hint to a text field', () => {
    const field = text('Title').hint('Write a concise headline');
    expect(field.meta.hint).toBe('Write a concise headline');
    expect(field.meta.label).toBe('Title');
    expect(field.meta.ui).toBe('text');
  });

  it('attaches a hint to a richText field', () => {
    const field = richText('Bio').hint('Third person, 2-3 sentences');
    expect(field.meta.hint).toBe('Third person, 2-3 sentences');
    expect(field.meta.ui).toBe('rich-text');
  });

  it('preserves hint through chaining', () => {
    const field = text('Title').hint('Short and punchy').max(60);
    expect(field.meta.hint).toBe('Short and punchy');
  });

  it('is undefined when not set', () => {
    const field = text('Title');
    expect(field.meta.hint).toBeUndefined();
  });
});

describe('number()', () => {
  it('creates a number field', () => {
    const field = number('Order');
    expect(field.meta.ui).toBe('number');
    expect(field.schema.parse(42)).toBe(42);
    expect(() => field.schema.parse('not a number')).toThrow();
  });

  it('supports .max() and .min()', () => {
    const field = number('Rating').min(1).max(5);
    expect(field.schema.parse(3)).toBe(3);
    expect(() => field.schema.parse(0)).toThrow();
    expect(() => field.schema.parse(6)).toThrow();
  });

  it('supports .int()', () => {
    const field = number('Count').int();
    expect(field.schema.parse(3)).toBe(3);
    expect(() => field.schema.parse(3.5)).toThrow();
  });

  it('supports .optional()', () => {
    const field = number('Order').optional();
    expect(field.meta.required).toBe(false);
    expect(field.schema.parse(undefined)).toBeUndefined();
  });
});

describe('boolean()', () => {
  it('creates a boolean field', () => {
    const field = boolean('Featured');
    expect(field.meta.ui).toBe('boolean');
    expect(field.schema.parse(true)).toBe(true);
    expect(() => field.schema.parse('yes')).toThrow();
  });
});

describe('select()', () => {
  it('creates an enum field with select UI hint', () => {
    const field = select('Status', ['draft', 'published', 'archived']);
    expect(field.meta.ui).toBe('select');
    expect(field.schema.parse('draft')).toBe('draft');
    expect(() => field.schema.parse('invalid')).toThrow();
  });
});

describe('reference()', () => {
  it('creates a reference field with reference UI hint', () => {
    const field = reference('Author', 'author');
    expect(field.meta.label).toBe('Author');
    expect(field.meta.ui).toBe('reference');
    expect(field.meta.required).toBe(true);
    expect(field.meta.targetBlockType).toBe('author');
  });

  it('is an instance of ReferenceField', () => {
    const field = reference('Author', 'author');
    expect(field).toBeInstanceOf(ReferenceField);
  });

  it('validates UUID strings', () => {
    const field = reference('Author', 'author');
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(field.schema.parse(uuid)).toBe(uuid);
    expect(() => field.schema.parse('not-a-uuid')).toThrow();
    expect(() => field.schema.parse(123)).toThrow();
  });

  it('supports .optional()', () => {
    const field = reference('Author', 'author').optional();
    expect(field.meta.required).toBe(false);
    expect(field.schema.parse(undefined)).toBeUndefined();
  });
});

describe('array()', () => {
  it('creates an array field from another field', () => {
    const tags = array('Tags', text('Tag'));
    expect(tags.meta.ui).toBe('array');
    expect(tags.schema.parse(['a', 'b'])).toEqual(['a', 'b']);
    expect(() => tags.schema.parse([1, 2])).toThrow();
  });

  it('preserves itemMeta from the item field', () => {
    const tags = array('Tags', text('Tag'));
    expect(tags.meta.itemMeta).toEqual({
      label: 'Tag',
      ui: 'text',
      required: true,
    });
  });

  it('preserves itemMeta for reference items', () => {
    const reviewers = array('Reviewers', reference('Reviewer', 'author'));
    expect(reviewers.meta.itemMeta?.ui).toBe('reference');
    expect(reviewers.meta.itemMeta?.targetBlockType).toBe('author');
  });
});

describe('object()', () => {
  it('creates a nested object field', () => {
    const address = object('Address', {
      street: text('Street'),
      city: text('City'),
    });
    expect(address.meta.ui).toBe('object');
    expect(
      address.schema.parse({ street: '123 Main', city: 'London' }),
    ).toEqual({ street: '123 Main', city: 'London' });
    expect(() => address.schema.parse({ street: 123 })).toThrow();
  });
});
