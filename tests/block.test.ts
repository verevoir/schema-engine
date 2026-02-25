import { describe, it, expect } from "vitest";
import {
  defineBlock,
  text,
  richText,
  number,
  boolean,
  select,
} from "../src/index.js";

describe("defineBlock()", () => {
  const hero = defineBlock({
    name: "hero",
    fields: {
      title: text("Title").max(60),
      body: richText("Body"),
      order: number("Sort Order").optional(),
      featured: boolean("Featured"),
      status: select("Status", ["draft", "published"]),
    },
  });

  it("has the correct name", () => {
    expect(hero.name).toBe("hero");
  });

  it("exposes field metadata", () => {
    expect(hero.fields.title.meta.label).toBe("Title");
    expect(hero.fields.title.meta.ui).toBe("text");
    expect(hero.fields.body.meta.ui).toBe("rich-text");
    expect(hero.fields.order.meta.required).toBe(false);
    expect(hero.fields.featured.meta.ui).toBe("boolean");
  });

  it("validates correct data", () => {
    const data = {
      title: "Hello World",
      body: "<p>Content here</p>",
      featured: true,
      status: "draft",
    };
    const result = hero.validate(data);
    expect(result.title).toBe("Hello World");
    expect(result.featured).toBe(true);
  });

  it("validates with optional fields present", () => {
    const data = {
      title: "Hello",
      body: "Body text",
      order: 5,
      featured: false,
      status: "published",
    };
    const result = hero.validate(data);
    expect(result.order).toBe(5);
  });

  it("rejects invalid data", () => {
    expect(() => hero.validate({})).toThrow();
    expect(() =>
      hero.validate({
        title: 123,
        body: "text",
        featured: true,
        status: "draft",
      }),
    ).toThrow();
  });

  it("rejects titles exceeding max length", () => {
    expect(() =>
      hero.validate({
        title: "a".repeat(61),
        body: "text",
        featured: true,
        status: "draft",
      }),
    ).toThrow();
  });

  it("rejects invalid select values", () => {
    expect(() =>
      hero.validate({
        title: "Hello",
        body: "text",
        featured: true,
        status: "invalid",
      }),
    ).toThrow();
  });
});
