import { describe, it, expect } from "vitest";
import {
  Role,
  Group,
  Tool,
  Prompt,
  Resource,
  AbstractBase,
  convertAll,
} from "../src/Common.js";
import type {
  Icon,
  Annotations,
  ToolAnnotations,
  PromptArgument,
  Converter,
} from "../src/Common.js";

// =========================================================================
// AbstractBase
// =========================================================================

describe("AbstractBase", () => {
  it("throws when name is empty", () => {
    expect(() => new Group("")).toThrow("name must not be null or empty");
  });

  it("uses DEFAULT_SEPARATOR by default", () => {
    const g = new Group("root");
    expect(g.nameSeparator).toBe(AbstractBase.DEFAULT_SEPARATOR);
  });

  it("allows a custom separator", () => {
    const g = new Group("root", "/");
    expect(g.nameSeparator).toBe("/");
  });
});

// =========================================================================
// Group — hierarchy & fully qualified names
// =========================================================================

describe("Group", () => {
  it("is root when created standalone", () => {
    const root = new Group("root");
    expect(root.isRoot).toBe(true);
    expect(root.parent).toBeNull();
    expect(root.getRoot()).toBe(root);
  });

  it("builds a parent → child hierarchy", () => {
    const root = new Group("com");
    const mid = new Group("example");
    const leaf = new Group("api");

    expect(root.addChildGroup(mid)).toBe(true);
    expect(mid.addChildGroup(leaf)).toBe(true);

    expect(mid.parent).toBe(root);
    expect(leaf.parent).toBe(mid);
    expect(leaf.isRoot).toBe(false);
    expect(leaf.getRoot()).toBe(root);
  });

  it("computes fully qualified name through the chain", () => {
    const root = new Group("com");
    const mid = new Group("example");
    const leaf = new Group("api");

    root.addChildGroup(mid);
    mid.addChildGroup(leaf);

    expect(root.getFullyQualifiedName()).toBe("com");
    expect(mid.getFullyQualifiedName()).toBe("com.example");
    expect(leaf.getFullyQualifiedName()).toBe("com.example.api");
  });

  it("uses custom separator in fully qualified name", () => {
    const root = new Group("com", "/");
    const child = new Group("api", "/");
    root.addChildGroup(child);

    expect(child.getFullyQualifiedName()).toBe("com/api");
  });

  it("prevents duplicate child groups", () => {
    const root = new Group("root");
    const child = new Group("child");

    expect(root.addChildGroup(child)).toBe(true);
    expect(root.addChildGroup(child)).toBe(false);
    expect(root.childGroups).toHaveLength(1);
  });

  it("removes child group and clears parent", () => {
    const root = new Group("root");
    const child = new Group("child");

    root.addChildGroup(child);
    expect(root.removeChildGroup(child)).toBe(true);
    expect(root.childGroups).toHaveLength(0);
    expect(child.parent).toBeNull();
  });

  it("returns false when removing non-existent child group", () => {
    const root = new Group("root");
    const other = new Group("other");
    expect(root.removeChildGroup(other)).toBe(false);
  });

  it("stores optional properties (title, description, meta, icons)", () => {
    const g = new Group("g");
    g.title = "My Group";
    g.description = "A description";
    g.meta = { key: "value" };
    const icon: Icon = { src: "icon.png", mimeType: "image/png" };
    g.icons = [icon];

    expect(g.title).toBe("My Group");
    expect(g.description).toBe("A description");
    expect(g.meta).toEqual({ key: "value" });
    expect(g.icons).toHaveLength(1);
    expect(g.icons![0].src).toBe("icon.png");
  });
});

// =========================================================================
// Group ↔ Tool bidirectional relationship
// =========================================================================

describe("Group ↔ Tool", () => {
  it("adds a tool and links parent group bidirectionally", () => {
    const group = new Group("g");
    const tool = new Tool("t");

    expect(group.addChildTool(tool)).toBe(true);
    expect(group.childTools).toContain(tool);
    expect(tool.parentGroups).toContain(group);
  });

  it("prevents duplicate tool additions", () => {
    const group = new Group("g");
    const tool = new Tool("t");

    group.addChildTool(tool);
    expect(group.addChildTool(tool)).toBe(false);
    expect(group.childTools).toHaveLength(1);
  });

  it("removes a tool and unlinks parent group", () => {
    const group = new Group("g");
    const tool = new Tool("t");

    group.addChildTool(tool);
    expect(group.removeChildTool(tool)).toBe(true);
    expect(group.childTools).toHaveLength(0);
    expect(tool.parentGroups).toHaveLength(0);
  });

  it("returns false when removing non-existent tool", () => {
    const group = new Group("g");
    const tool = new Tool("t");
    expect(group.removeChildTool(tool)).toBe(false);
  });
});

// =========================================================================
// Group ↔ Prompt bidirectional relationship
// =========================================================================

describe("Group ↔ Prompt", () => {
  it("adds a prompt and links parent group bidirectionally", () => {
    const group = new Group("g");
    const prompt = new Prompt("p");

    expect(group.addChildPrompt(prompt)).toBe(true);
    expect(group.childPrompts).toContain(prompt);
    expect(prompt.parentGroups).toContain(group);
  });

  it("prevents duplicate prompt additions", () => {
    const group = new Group("g");
    const prompt = new Prompt("p");

    group.addChildPrompt(prompt);
    expect(group.addChildPrompt(prompt)).toBe(false);
  });

  it("removes a prompt and unlinks parent group", () => {
    const group = new Group("g");
    const prompt = new Prompt("p");

    group.addChildPrompt(prompt);
    expect(group.removeChildPrompt(prompt)).toBe(true);
    expect(group.childPrompts).toHaveLength(0);
    expect(prompt.parentGroups).toHaveLength(0);
  });
});

// =========================================================================
// Group ↔ Resource bidirectional relationship
// =========================================================================

describe("Group ↔ Resource", () => {
  it("adds a resource and links parent group bidirectionally", () => {
    const group = new Group("g");
    const resource = new Resource("r");

    expect(group.addChildResource(resource)).toBe(true);
    expect(group.childResources).toContain(resource);
    expect(resource.parentGroups).toContain(group);
  });

  it("prevents duplicate resource additions", () => {
    const group = new Group("g");
    const resource = new Resource("r");

    group.addChildResource(resource);
    expect(group.addChildResource(resource)).toBe(false);
  });

  it("removes a resource and unlinks parent group", () => {
    const group = new Group("g");
    const resource = new Resource("r");

    group.addChildResource(resource);
    expect(group.removeChildResource(resource)).toBe(true);
    expect(group.childResources).toHaveLength(0);
    expect(resource.parentGroups).toHaveLength(0);
  });
});

// =========================================================================
// AbstractLeaf — shared leaf behavior
// =========================================================================

describe("AbstractLeaf (via Tool)", () => {
  it("returns its name as fully qualified name", () => {
    const tool = new Tool("myTool");
    expect(tool.getFullyQualifiedName()).toBe("myTool");
  });

  it("can belong to multiple parent groups", () => {
    const g1 = new Group("g1");
    const g2 = new Group("g2");
    const tool = new Tool("shared");

    g1.addChildTool(tool);
    g2.addChildTool(tool);

    expect(tool.parentGroups).toHaveLength(2);
    expect(tool.parentGroups).toContain(g1);
    expect(tool.parentGroups).toContain(g2);
  });

  it("getParentGroupRoots returns roots of all parent groups", () => {
    const root = new Group("root");
    const child = new Group("child");
    root.addChildGroup(child);

    const tool = new Tool("tool");
    child.addChildTool(tool);

    const roots = tool.getParentGroupRoots();
    expect(roots).toHaveLength(1);
    expect(roots[0]).toBe(root);
  });

  it("prevents duplicate parent group registration", () => {
    const group = new Group("g");
    const tool = new Tool("t");

    expect(tool.addParentGroup(group)).toBe(true);
    expect(tool.addParentGroup(group)).toBe(false);
    expect(tool.parentGroups).toHaveLength(1);
  });

  it("returns false when removing non-existent parent group", () => {
    const tool = new Tool("t");
    const group = new Group("g");
    expect(tool.removeParentGroup(group)).toBe(false);
  });
});

// =========================================================================
// Tool
// =========================================================================

describe("Tool", () => {
  it("stores optional schemas and annotations", () => {
    const tool = new Tool("myTool");
    tool.inputSchema = '{ "type": "object" }';
    tool.outputSchema = '{ "type": "string" }';
    tool.toolAnnotations = {
      title: "MyTool",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
      returnDirect: true,
    };

    expect(tool.inputSchema).toBe('{ "type": "object" }');
    expect(tool.outputSchema).toBe('{ "type": "string" }');
    expect(tool.toolAnnotations!.readOnlyHint).toBe(true);
    expect(tool.toolAnnotations!.returnDirect).toBe(true);
  });
});

// =========================================================================
// Prompt & PromptArgument
// =========================================================================

describe("Prompt", () => {
  it("adds and removes prompt arguments", () => {
    const prompt = new Prompt("myPrompt");
    const arg: PromptArgument = { name: "query", required: true };

    expect(prompt.addPromptArgument(arg)).toBe(true);
    expect(prompt.promptArguments).toHaveLength(1);
    expect(prompt.promptArguments[0].name).toBe("query");
    expect(prompt.promptArguments[0].required).toBe(true);

    expect(prompt.removePromptArgument(arg)).toBe(true);
    expect(prompt.promptArguments).toHaveLength(0);
  });

  it("prevents duplicate prompt arguments", () => {
    const prompt = new Prompt("myPrompt");
    const arg: PromptArgument = { name: "query" };

    prompt.addPromptArgument(arg);
    expect(prompt.addPromptArgument(arg)).toBe(false);
    expect(prompt.promptArguments).toHaveLength(1);
  });

  it("returns false when removing non-existent argument", () => {
    const prompt = new Prompt("myPrompt");
    const arg: PromptArgument = { name: "other" };
    expect(prompt.removePromptArgument(arg)).toBe(false);
  });
});

// =========================================================================
// Resource
// =========================================================================

describe("Resource", () => {
  it("stores optional URI, size, mimeType and annotations", () => {
    const resource = new Resource("doc");
    resource.uri = "file:///data.json";
    resource.size = 1024;
    resource.mimeType = "application/json";
    resource.annotations = {
      audience: [Role.USER],
      priority: 1,
      lastModified: "2026-01-01T00:00:00Z",
    };

    expect(resource.uri).toBe("file:///data.json");
    expect(resource.size).toBe(1024);
    expect(resource.mimeType).toBe("application/json");
    expect(resource.annotations!.audience).toEqual([Role.USER]);
    expect(resource.annotations!.priority).toBe(1);
  });
});

// =========================================================================
// convertAll utility
// =========================================================================

describe("convertAll", () => {
  it("maps and filters nullish results", () => {
    const items = [1, 2, 3, 4, 5];
    const result = convertAll(items, (n) => (n % 2 === 0 ? `even:${n}` : null));
    expect(result).toEqual(["even:2", "even:4"]);
  });

  it("returns all items when none are nullish", () => {
    const result = convertAll(["a", "b"], (s) => s.toUpperCase());
    expect(result).toEqual(["A", "B"]);
  });

  it("returns empty array from empty input", () => {
    const result = convertAll([], (x) => x);
    expect(result).toEqual([]);
  });
});

// =========================================================================
// Converter interface (structural typing check)
// =========================================================================

describe("Converter interface", () => {
  it("can be implemented and used for bidirectional conversion", () => {
    const toolConverter: Converter<Tool, { n: string }> = {
      fromInternal: (tool) => ({ n: tool.name }),
      toInternal: (ext) => new Tool(ext.n),
    };

    const tool = new Tool("test");
    const ext = toolConverter.fromInternal(tool);
    expect(ext).toEqual({ n: "test" });

    const back = toolConverter.toInternal(ext);
    expect(back.name).toBe("test");
  });
});

// =========================================================================
// Complex tree scenario
// =========================================================================

describe("Complex tree scenario", () => {
  it("builds a full tree and verifies all relationships", () => {
    // com.example.api
    const com = new Group("com");
    const example = new Group("example");
    const api = new Group("api");

    com.addChildGroup(example);
    example.addChildGroup(api);

    // Tools under api
    const listTool = new Tool("list");
    const createTool = new Tool("create");
    api.addChildTool(listTool);
    api.addChildTool(createTool);

    // Prompts under example
    const helpPrompt = new Prompt("help");
    example.addChildPrompt(helpPrompt);

    // Resources under com
    const readme = new Resource("readme");
    readme.uri = "file:///README.md";
    com.addChildResource(readme);

    // Verify structure
    expect(com.childGroups).toHaveLength(1);
    expect(example.childGroups).toHaveLength(1);
    expect(api.childTools).toHaveLength(2);
    expect(example.childPrompts).toHaveLength(1);
    expect(com.childResources).toHaveLength(1);

    // Verify FQN
    expect(api.getFullyQualifiedName()).toBe("com.example.api");

    // Verify roots from leaves
    expect(listTool.getParentGroupRoots()[0]).toBe(com);
    expect(helpPrompt.getParentGroupRoots()[0]).toBe(com);
    expect(readme.getParentGroupRoots()[0]).toBe(com);

    // Remove tool and check cleanup
    api.removeChildTool(listTool);
    expect(api.childTools).toHaveLength(1);
    expect(listTool.parentGroups).toHaveLength(0);
  });
});

// =========================================================================
// FAILURE / EDGE CASE / STATE CONSISTENCY TESTS
// =========================================================================

describe("AbstractBase — failure cases", () => {
  it("throws when name is null-ish (undefined coerced)", () => {
    // @ts-expect-error — testing runtime guard for JS callers
    expect(() => new Group(undefined)).toThrow();
  });

  it("throws when name is null", () => {
    // @ts-expect-error — testing runtime guard for JS callers
    expect(() => new Group(null)).toThrow();
  });

  it("name remains the value set at construction (readonly intent)", () => {
    const g = new Group("immutable");
    expect(g.name).toBe("immutable");
    // TypeScript's `readonly` prevents assignment at compile-time.
    // At runtime, there is no enforcement — this test verifies the intent.
  });
});

describe("Group — double remove and state consistency", () => {
  it("double-removing a child group is idempotent (returns false second time)", () => {
    const root = new Group("root");
    const child = new Group("child");

    root.addChildGroup(child);
    expect(root.removeChildGroup(child)).toBe(true);
    expect(root.removeChildGroup(child)).toBe(false);
    expect(root.childGroups).toHaveLength(0);
    expect(child.parent).toBeNull();
  });

  it("double-removing a child tool is idempotent", () => {
    const group = new Group("g");
    const tool = new Tool("t");

    group.addChildTool(tool);
    group.removeChildTool(tool);
    expect(group.removeChildTool(tool)).toBe(false);
    expect(group.childTools).toHaveLength(0);
    expect(tool.parentGroups).toHaveLength(0);
  });

  it("double-removing a child prompt is idempotent", () => {
    const group = new Group("g");
    const prompt = new Prompt("p");

    group.addChildPrompt(prompt);
    group.removeChildPrompt(prompt);
    expect(group.removeChildPrompt(prompt)).toBe(false);
  });

  it("double-removing a child resource is idempotent", () => {
    const group = new Group("g");
    const resource = new Resource("r");

    group.addChildResource(resource);
    group.removeChildResource(resource);
    expect(group.removeChildResource(resource)).toBe(false);
  });

  it("re-adding a child group after removal works correctly", () => {
    const root = new Group("root");
    const child = new Group("child");

    root.addChildGroup(child);
    root.removeChildGroup(child);
    expect(child.parent).toBeNull();

    expect(root.addChildGroup(child)).toBe(true);
    expect(child.parent).toBe(root);
    expect(root.childGroups).toHaveLength(1);
  });

  it("re-adding a tool after removal restores bidirectional link", () => {
    const group = new Group("g");
    const tool = new Tool("t");

    group.addChildTool(tool);
    group.removeChildTool(tool);

    expect(group.addChildTool(tool)).toBe(true);
    expect(group.childTools).toContain(tool);
    expect(tool.parentGroups).toContain(group);
  });

  it("removing child group from wrong parent returns false and keeps the link intact", () => {
    const parent1 = new Group("p1");
    const parent2 = new Group("p2");
    const child = new Group("child");

    parent1.addChildGroup(child);

    // trying to remove from parent2 where it was never added
    expect(parent2.removeChildGroup(child)).toBe(false);

    // original relationship still intact
    expect(child.parent).toBe(parent1);
    expect(parent1.childGroups).toContain(child);
  });
});

describe("Group — deeply nested tree", () => {
  it("getRoot traverses 5 levels deep", () => {
    const g1 = new Group("l1");
    const g2 = new Group("l2");
    const g3 = new Group("l3");
    const g4 = new Group("l4");
    const g5 = new Group("l5");

    g1.addChildGroup(g2);
    g2.addChildGroup(g3);
    g3.addChildGroup(g4);
    g4.addChildGroup(g5);

    expect(g5.getRoot()).toBe(g1);
    expect(g5.getFullyQualifiedName()).toBe("l1.l2.l3.l4.l5");
  });

  it("FQN updates correctly after re-parenting a subtree", () => {
    const root1 = new Group("com");
    const root2 = new Group("org");
    const child = new Group("api");

    root1.addChildGroup(child);
    expect(child.getFullyQualifiedName()).toBe("com.api");

    root1.removeChildGroup(child);
    root2.addChildGroup(child);
    expect(child.getFullyQualifiedName()).toBe("org.api");
    expect(child.getRoot()).toBe(root2);
  });
});

describe("AbstractLeaf — failure cases", () => {
  it("removing parent group from tool not in that group returns false", () => {
    const g1 = new Group("g1");
    const g2 = new Group("g2");
    const tool = new Tool("t");

    g1.addChildTool(tool);

    expect(tool.removeParentGroup(g2)).toBe(false);
    expect(tool.parentGroups).toHaveLength(1);
    expect(tool.parentGroups).toContain(g1);
  });

  it("getParentGroupRoots with multiple disjoint trees", () => {
    const rootA = new Group("rootA");
    const childA = new Group("childA");
    rootA.addChildGroup(childA);

    const rootB = new Group("rootB");

    const tool = new Tool("shared");
    childA.addChildTool(tool);
    rootB.addChildTool(tool);

    const roots = tool.getParentGroupRoots();
    expect(roots).toHaveLength(2);
    expect(roots).toContain(rootA);
    expect(roots).toContain(rootB);
  });
});

describe("Prompt — failure cases", () => {
  it("double-removing a prompt argument is idempotent", () => {
    const prompt = new Prompt("p");
    const arg: PromptArgument = { name: "x" };

    prompt.addPromptArgument(arg);
    prompt.removePromptArgument(arg);
    expect(prompt.removePromptArgument(arg)).toBe(false);
    expect(prompt.promptArguments).toHaveLength(0);
  });

  it("re-adding a prompt argument after removal works", () => {
    const prompt = new Prompt("p");
    const arg: PromptArgument = { name: "x", required: true };

    prompt.addPromptArgument(arg);
    prompt.removePromptArgument(arg);
    expect(prompt.addPromptArgument(arg)).toBe(true);
    expect(prompt.promptArguments).toHaveLength(1);
  });
});

describe("Optional properties — undefined by default", () => {
  it("Group optional properties are undefined when not set", () => {
    const g = new Group("g");
    expect(g.title).toBeUndefined();
    expect(g.description).toBeUndefined();
    expect(g.meta).toBeUndefined();
    expect(g.icons).toBeUndefined();
  });

  it("Tool optional properties are undefined when not set", () => {
    const t = new Tool("t");
    expect(t.inputSchema).toBeUndefined();
    expect(t.outputSchema).toBeUndefined();
    expect(t.toolAnnotations).toBeUndefined();
  });

  it("Resource optional properties are undefined when not set", () => {
    const r = new Resource("r");
    expect(r.uri).toBeUndefined();
    expect(r.size).toBeUndefined();
    expect(r.mimeType).toBeUndefined();
    expect(r.annotations).toBeUndefined();
  });
});

describe("convertAll — edge / failure cases", () => {
  it("filters out all items when every conversion returns null", () => {
    const result = convertAll([1, 2, 3], () => null);
    expect(result).toEqual([]);
  });

  it("filters out all items when every conversion returns undefined", () => {
    const result = convertAll([1, 2, 3], () => undefined);
    expect(result).toEqual([]);
  });

  it("handles mixed null/undefined/valid results", () => {
    const result = convertAll([1, 2, 3, 4], (n) => {
      if (n === 1) return null;
      if (n === 2) return undefined;
      return `ok:${n}`;
    });
    expect(result).toEqual(["ok:3", "ok:4"]);
  });
});
