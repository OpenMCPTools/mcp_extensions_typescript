export enum Role {
  USER = "USER",
  ASSISTANT = "ASSISTANT",
}

// ---------------------------------------------------------------------------
// Data interfaces (replacing Java-style DTO classes with getters/setters)
// ---------------------------------------------------------------------------

export interface Icon {
  src?: string;
  mimeType?: string;
  sizes?: string[];
  theme?: string;
}

export interface Annotations {
  audience?: Role[];
  priority?: number;
  lastModified?: string;
}

export interface ToolAnnotations {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
  returnDirect?: boolean;
}

export interface PromptArgument {
  name: string;
  title?: string;
  description?: string;
  meta?: Record<string, unknown>;
  icons?: Icon[];
  required?: boolean;
}

// ---------------------------------------------------------------------------
// Tree structure — classes retained for bidirectional relationship logic
// ---------------------------------------------------------------------------

export abstract class AbstractBase {
  static readonly DEFAULT_SEPARATOR = ".";

  readonly name: string;
  readonly nameSeparator: string;
  title?: string;
  description?: string;
  meta?: Record<string, unknown>;
  icons?: Icon[];

  protected constructor(name: string, nameSeparator = AbstractBase.DEFAULT_SEPARATOR) {
    if (!name) throw new Error("name must not be null or empty");
    this.name = name;
    this.nameSeparator = nameSeparator;
  }

  abstract getFullyQualifiedName(): string;
}

export class Group extends AbstractBase {
  parent: Group | null = null;
  readonly childGroups: Group[] = [];
  readonly childTools: Tool[] = [];
  readonly childPrompts: Prompt[] = [];
  readonly childResources: Resource[] = [];

  constructor(name: string, nameSeparator?: string) {
    super(name, nameSeparator);
  }

  getRoot(): Group {
    return this.parent?.getRoot() ?? this;
  }

  get isRoot(): boolean {
    return this.parent === null;
  }

  // -- Child Groups --

  addChildGroup(child: Group): boolean {
    if (this.childGroups.includes(child)) return false;
    this.childGroups.push(child);
    child.parent = this;
    return true;
  }

  removeChildGroup(child: Group): boolean {
    const index = this.childGroups.indexOf(child);
    if (index === -1) return false;
    this.childGroups.splice(index, 1);
    child.parent = null;
    return true;
  }

  // -- Child Tools --

  addChildTool(child: Tool): boolean {
    if (this.childTools.includes(child)) return false;
    this.childTools.push(child);
    child.addParentGroup(this);
    return true;
  }

  removeChildTool(child: Tool): boolean {
    const index = this.childTools.indexOf(child);
    if (index === -1) return false;
    this.childTools.splice(index, 1);
    child.removeParentGroup(this);
    return true;
  }

  // -- Child Prompts --

  addChildPrompt(child: Prompt): boolean {
    if (this.childPrompts.includes(child)) return false;
    this.childPrompts.push(child);
    child.addParentGroup(this);
    return true;
  }

  removeChildPrompt(child: Prompt): boolean {
    const index = this.childPrompts.indexOf(child);
    if (index === -1) return false;
    this.childPrompts.splice(index, 1);
    child.removeParentGroup(this);
    return true;
  }

  // -- Child Resources --

  addChildResource(child: Resource): boolean {
    if (this.childResources.includes(child)) return false;
    this.childResources.push(child);
    child.addParentGroup(this);
    return true;
  }

  removeChildResource(child: Resource): boolean {
    const index = this.childResources.indexOf(child);
    if (index === -1) return false;
    this.childResources.splice(index, 1);
    child.removeParentGroup(this);
    return true;
  }

  // -- Fully Qualified Name --

  getFullyQualifiedName(): string {
    if (!this.parent) return this.name;
    return this.parent.getFullyQualifiedName() + this.nameSeparator + this.name;
  }
}

export class AbstractLeaf extends AbstractBase {
  readonly parentGroups: Group[] = [];

  protected constructor(name: string, nameSeparator?: string) {
    super(name, nameSeparator);
  }

  addParentGroup(group: Group): boolean {
    if (this.parentGroups.includes(group)) return false;
    this.parentGroups.push(group);
    return true;
  }

  removeParentGroup(group: Group): boolean {
    const index = this.parentGroups.indexOf(group);
    if (index === -1) return false;
    this.parentGroups.splice(index, 1);
    return true;
  }

  getParentGroupRoots(): Group[] {
    return this.parentGroups.map((g) => g.getRoot());
  }

  getFullyQualifiedName(): string {
    return this.name;
  }
}

export class Tool extends AbstractLeaf {
  inputSchema?: string;
  outputSchema?: string;
  toolAnnotations?: ToolAnnotations;

  constructor(name: string) {
    super(name);
  }
}

export class Prompt extends AbstractLeaf {
  readonly promptArguments: PromptArgument[] = [];

  constructor(name: string) {
    super(name);
  }

  addPromptArgument(arg: PromptArgument): boolean {
    if (this.promptArguments.includes(arg)) return false;
    this.promptArguments.push(arg);
    return true;
  }

  removePromptArgument(arg: PromptArgument): boolean {
    const index = this.promptArguments.indexOf(arg);
    if (index === -1) return false;
    this.promptArguments.splice(index, 1);
    return true;
  }
}

export class Resource extends AbstractLeaf {
  uri?: string;
  size?: number;
  mimeType?: string;
  annotations?: Annotations;

  constructor(name: string) {
    super(name);
  }
}

// ---------------------------------------------------------------------------
// Generic converter — replaces 6 Java-style interfaces + 5 abstract classes
// ---------------------------------------------------------------------------

export interface Converter<TInternal, TExternal> {
  fromInternal(item: TInternal): TExternal;
  toInternal(item: TExternal): TInternal;
}

/** Batch-convert an array, filtering out nullish results. */
export function convertAll<T, U>(
  items: T[],
  convert: (item: T) => U | null | undefined,
): U[] {
  return items.map(convert).filter((v): v is NonNullable<U> => v != null);
}
