export enum Role {
    USER = "USER",
    ASSISTANT = "ASSISTANT"
}

/**
 * Icon definition
 */
export class Icon {
    private src: string | undefined;
    private mimeType: string | undefined;
    private sizes: string[] | undefined;
    private theme: string | undefined;

    public getSrc(): string | undefined {
        return this.src;
    }

    public setSrc(src: string): void {
        this.src = src;
    }

    public getMimeType(): string | undefined {
        return this.mimeType;
    }

    public setMimeType(mimeType: string): void {
        this.mimeType = mimeType;
    }

    public getSizes(): string[] | undefined {
        return this.sizes;
    }

    public setSizes(sizes: string[]): void {
        this.sizes = sizes;
    }

    public getTheme(): string | undefined {
        return this.theme;
    }

    public setTheme(theme: string): void {
        this.theme = theme;
    }

    public toString(): string {
        return `Icon [src=${this.src}, mimeType=${this.mimeType}, sizes=${this.sizes}, theme=${this.theme}]`;
    }
}

export abstract class AbstractBase {
    public static readonly DEFAULT_SEPARATOR: string = ".";

    protected readonly nameSeparator: string;
    protected readonly name: string;
    protected title: string | undefined;
    protected description: string | undefined;
    protected meta: Map<string, any> | undefined;
    protected icons: Icon[] | undefined;

    protected constructor(name: string, nameSeparator?: string) {
        if (name === null || name === undefined) {
            throw new Error("name must not be null");
        }
        this.name = name;
        this.nameSeparator = nameSeparator !== undefined ? nameSeparator : AbstractBase.DEFAULT_SEPARATOR;
    }

    public getName(): string {
        return this.name;
    }

    public getTitle(): string | undefined {
        return this.title;
    }

    public setTitle(title: string): void {
        this.title = title;
    }

    public getDescription(): string | undefined {
        return this.description;
    }

    public setDescription(description: string): void {
        this.description = description;
    }

    public getIcons(): Icon[] | undefined {
        return this.icons;
    }

    public setIcons(icons: Icon[]): void {
        this.icons = icons;
    }

    public getMeta(): Map<string, any> | undefined {
        return this.meta;
    }

    public setMeta(meta: Map<string, any>): void {
        this.meta = meta;
    }

    public hashCode(): number {
        // Simple hash code implementation based on name
        let hash = 0;
        if (this.name.length === 0) return hash;
        for (let i = 0; i < this.name.length; i++) {
            const chr = this.name.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    public equals(obj: any): boolean {
        if (this === obj) {
            return true;
        }
        if (obj === null || obj === undefined) {
            return false;
        }
        if (this.constructor !== obj.constructor) {
            return false;
        }
        const other = obj as AbstractBase;
        return this.name === other.name;
    }

    public abstract getFullyQualifiedName(): string;
}

export class Group extends AbstractBase {
    protected parent: Group | null = null;
    protected readonly childGroups: Group[];
    protected readonly childTools: Tool[];
    protected readonly childPrompts: Prompt[];
    protected readonly childResources: Resource[];

    public constructor(name: string, nameSeparator?: string) {
        super(name, nameSeparator !== undefined ? nameSeparator : AbstractBase.DEFAULT_SEPARATOR);
        this.childGroups = [];
        this.childTools = [];
        this.childPrompts = [];
        this.childResources = [];
    }

    public getParent(): Group | null {
        return this.parent;
    }

    public setParent(parent: Group): void {
        this.parent = parent;
    }

    public getRoot(): Group {
        const parent = this.parent;
        if (parent === null) {
            return this;
        } else {
            return parent.getRoot();
        }
    }

    public isRoot(): boolean {
        return this.parent === null;
    }

    public addChildGroup(childGroup: Group): boolean {
        const added = this.childGroups.indexOf(childGroup) === -1;
        if (added) {
            this.childGroups.push(childGroup);
            childGroup.parent = this;
            return true;
        }
        return false;
    }

    public removeChildGroup(childGroup: Group): boolean {
        const index = this.childGroups.indexOf(childGroup);
        if (index !== -1) {
            this.childGroups.splice(index, 1);
            childGroup.parent = null;
            return true;
        }
        return false;
    }

    public getChildrenGroups(): Group[] {
        return this.childGroups;
    }

    public addChildTool(childTool: Tool): boolean {
        const added = this.childTools.indexOf(childTool) === -1;
        if (added) {
            this.childTools.push(childTool);
            childTool.addParentGroup(this);
            return true;
        }
        return false;
    }

    public removeChildTool(childTool: Tool): boolean {
        const index = this.childTools.indexOf(childTool);
        const removed = index !== -1;
        if (removed) {
            this.childTools.splice(index, 1);
            childTool.removeParentGroup(this);
            return true;
        }
        return false;
    }

    public getChildrenTools(): Tool[] {
        return this.childTools;
    }

    public addChildPrompt(childPrompt: Prompt): boolean {
        const added = this.childPrompts.indexOf(childPrompt) === -1;
        if (added) {
            this.childPrompts.push(childPrompt);
            childPrompt.addParentGroup(this);
            return true;
        }
        return false;
    }

    public removeChildPrompt(childPrompt: Prompt): boolean {
        const index = this.childPrompts.indexOf(childPrompt);
        const removed = index !== -1;
        if (removed) {
            this.childPrompts.splice(index, 1);
            childPrompt.removeParentGroup(this);
            return true;
        }
        return false;
    }

    public getChildrenResources(): Resource[] {
        return this.childResources;
    }

    public addChildResource(childResource: Resource): boolean {
        const added = this.childResources.indexOf(childResource) === -1;
        if (added) {
            this.childResources.push(childResource);
            childResource.addParentGroup(this);
            return true;
        }
        return false;
    }

    public removeChildResource(childResource: Resource): boolean {
        const index = this.childResources.indexOf(childResource);
        const removed = index !== -1;
        if (removed) {
            this.childResources.splice(index, 1);
            childResource.removeParentGroup(this);
            return true;
        }
        return false;
    }

    public getChildrenPrompts(): Prompt[] {
        return this.childPrompts;
    }

    protected getFullyQualifiedNameRecursive(sb: string, tg: Group): string {
        const parent = tg.getParent();
        if (parent !== null) {
            const parentName = this.getFullyQualifiedNameRecursive(sb, parent);
            return parentName + this.nameSeparator + tg.getName();
        }
        return tg.getName();
    }

    public getFullyQualifiedName(): string {
        return this.getFullyQualifiedNameRecursive("", this);
    }

    public toString(): string {
        return `Group [name=${this.name}, fqName=${this.getFullyQualifiedName()}, isRoot=${this.isRoot()}, title=${this.title}, description=${this.description}, meta=${this.meta}, childGroups=${this.childGroups}, childTools=${this.childTools}, childPrompts=${this.childPrompts}]`;
    }
}

export class AbstractLeaf extends AbstractBase {
    protected parentGroups: Group[] = [];

    protected constructor(name: string, nameSeparator?: string) {
        if (nameSeparator !== undefined) {
            super(name, nameSeparator);
        } else {
            super(name);
        }
    }

    public addParentGroup(parentGroup: Group): boolean {
        if (parentGroup === null || parentGroup === undefined) {
            throw new Error("parentGroup must not be null");
        }
        return this.parentGroups.indexOf(parentGroup) === -1 && (this.parentGroups.push(parentGroup), true);
    }

    public removeParentGroup(parentGroup: Group): boolean {
        const index = this.parentGroups.indexOf(parentGroup);
        if (index !== -1) {
            this.parentGroups.splice(index, 1);
            return true;
        }
        return false;
    }

    public getParentGroups(): Group[] {
        return this.parentGroups;
    }

    public getParentGroupRoots(): Group[] {
        const parentGroups = this.parentGroups;
        return parentGroups.map(group => group.getRoot());
    }

    public getFullyQualifiedName(): string {
        return this.name;
    }
}

export class Annotations {
    private audience: Role[] | undefined;
    private priority: number | undefined;
    private lastModified: string | undefined;

    public constructor(audience: Role[], priority: number, lastModified: string) {
        this.audience = audience;
        this.priority = priority;
        this.lastModified = lastModified;
    }

    public getAudience(): Role[] | undefined {
        return this.audience;
    }

    public setAudience(audience: Role[]): void {
        this.audience = audience;
    }

    public getPriority(): number | undefined {
        return this.priority;
    }

    public setPriority(priority: number): void {
        this.priority = priority;
    }

    public getLastModified(): string | undefined {
        return this.lastModified;
    }

    public setLastModified(lastModified: string): void {
        this.lastModified = lastModified;
    }

    public toString(): string {
        return `Annotations [audience=${this.audience}, priority=${this.priority}, lastModified=${this.lastModified}]`;
    }
}

export class ToolAnnotations {
    protected title: string | undefined;
    protected readOnlyHint: boolean | undefined;
    protected destructiveHint: boolean | undefined;
    protected idempotentHint: boolean | undefined;
    protected openWorldHint: boolean | undefined;
    protected returnDirect: boolean | undefined;

    public constructor() {
    }

    public getTitle(): string | undefined {
        return this.title;
    }

    public setTitle(title: string): void {
        this.title = title;
    }

    public getReadOnlyHint(): boolean | undefined {
        return this.readOnlyHint;
    }

    public setReadOnlyHint(readOnlyHint: boolean): void {
        this.readOnlyHint = readOnlyHint;
    }

    public getDestructiveHint(): boolean | undefined {
        return this.destructiveHint;
    }

    public setDestructiveHint(destructiveHint: boolean): void {
        this.destructiveHint = destructiveHint;
    }

    public getIdempotentHint(): boolean | undefined {
        return this.idempotentHint;
    }

    public setIdempotentHint(idempotentHint: boolean): void {
        this.idempotentHint = idempotentHint;
    }

    public getOpenWorldHint(): boolean | undefined {
        return this.openWorldHint;
    }

    public setOpenWorldHint(openWorldHint: boolean): void {
        this.openWorldHint = openWorldHint;
    }

    public getReturnDirect(): boolean | undefined {
        return this.returnDirect;
    }

    public setReturnDirect(returnDirect: boolean): void {
        this.returnDirect = returnDirect;
    }

    public toString(): string {
        return `ToolAnnotation [title=${this.title}, readOnlyHint=${this.readOnlyHint}, destructiveHint=${this.destructiveHint}, idempotentHint=${this.idempotentHint}, openWorldHint=${this.openWorldHint}, returnDirect=${this.returnDirect}]`;
    }
}

export class Tool extends AbstractLeaf {
    protected inputSchema: string | undefined;
    protected outputSchema: string | undefined;
    protected toolAnnotations: ToolAnnotations | undefined;

    public constructor(name: string) {
        super(name);
    }

    public getInputSchema(): string | undefined {
        return this.inputSchema;
    }

    public setInputSchema(inputSchema: string): void {
        this.inputSchema = inputSchema;
    }

    public getOutputSchema(): string | undefined {
        return this.outputSchema;
    }

    public setOutputSchema(outputSchema: string): void {
        this.outputSchema = outputSchema;
    }

    public getToolAnnotations(): ToolAnnotations | undefined {
        return this.toolAnnotations;
    }

    public setToolAnnotations(toolAnnotations: ToolAnnotations): void {
        this.toolAnnotations = toolAnnotations;
    }

    public toString(): string {
        return `Tool [name=${this.name}, fqName=${this.getFullyQualifiedName()}, title=${this.title}, description=${this.description}, meta=${this.meta}, inputSchema=${this.inputSchema}, outputSchema=${this.outputSchema}, toolAnnotation=${this.toolAnnotations}]`;
    }
}

export class PromptArgument extends AbstractBase {
    protected required: boolean = false;

    public constructor(name: string) {
        super(name);
    }

    public setRequired(required: boolean): void {
        this.required = required;
    }

    public isRequired(): boolean {
        return this.required;
    }

    public toString(): string {
        return `PromptArgument [required=${this.required}, name=${this.name}, title=${this.title}, description=${this.description}, meta=${this.meta}]`;
    }

    public getFullyQualifiedName(): string {
        return this.name;
    }
}

export class Prompt extends AbstractLeaf {
    protected promptArguments: PromptArgument[] = [];

    public constructor(name: string) {
        super(name);
    }

    public getPromptArguments(): PromptArgument[] {
        return this.promptArguments;
    }

    public addPromptArgument(promptArgument: PromptArgument): boolean {
        if (promptArgument === null || promptArgument === undefined) {
            throw new Error("promptArgument must not be null");
        }
        return this.promptArguments.indexOf(promptArgument) === -1 && (this.promptArguments.push(promptArgument), true);
    }

    public removeParentGroup(promptArgument: PromptArgument): boolean {
        const index = this.promptArguments.indexOf(promptArgument);
        if (index !== -1) {
            this.promptArguments.splice(index, 1);
            return true;
        }
        return false;
    }

    public toString(): string {
        return `Prompt [promptArguments=${this.promptArguments}, name=${this.name}, fqName=${this.getFullyQualifiedName()}, title=${this.title}, description=${this.description}, meta=${this.meta}]`;
    }
}

export class Resource extends AbstractLeaf {
    protected uri: string | undefined;
    protected size: number | undefined;
    protected mimeType: string | undefined;
    protected annotations: Annotations | undefined;

    public constructor(name: string) {
        super(name);
    }

    public getUri(): string | undefined {
        return this.uri;
    }

    public setUri(uri: string): void {
        this.uri = uri;
    }

    public getSize(): number | undefined {
        return this.size;
    }

    public setSize(size: number): void {
        this.size = size;
    }

    public getMimeType(): string | undefined {
        return this.mimeType;
    }

    public setMimeType(mimeType: string): void {
        this.mimeType = mimeType;
    }

    public getAnnotations(): Annotations | undefined {
        return this.annotations;
    }

    public setAnnotations(annotations: Annotations): void {
        this.annotations = annotations;
    }

    public toString(): string {
        return `Resource [name=${this.name}, fqName=${this.getFullyQualifiedName()}, title=${this.title}, description=${this.description}, meta=${this.meta}, uri=${this.uri}, size=${this.size}, mimeType=${this.mimeType}, annotations=${this.annotations}]`;
    }
}

export interface GroupConverter<GroupType> {
    convertFromGroups(groups: Group[]): GroupType[];
    convertFromGroup(group: Group): GroupType;
    convertToGroups(groups: GroupType[]): Group[];
    convertToGroup(group: GroupType): Group;
}

export abstract class AbstractGroupConverter<GroupType> implements GroupConverter<GroupType> {
    public convertFromGroups(groups: Group[]): GroupType[] {
        return groups
            .map(gn => this.convertFromGroup(gn))
            .filter(item => item !== null && item !== undefined);
    }

    public abstract convertFromGroup(group: Group): GroupType;

    public convertToGroups(groups: GroupType[]): Group[] {
        return groups
            .map(g => this.convertToGroup(g))
            .filter(item => item !== null && item !== undefined);
    }

    public abstract convertToGroup(group: GroupType): Group;
}

export interface ToolConverter<ToolType> {
    convertFromTools(tools: Tool[]): ToolType[];
    convertFromTool(tool: Tool): ToolType;
    convertToTools(tools: ToolType[]): Tool[];
    convertToTool(tool: ToolType): Tool;
}

export abstract class AbstractToolConverter<ToolType> implements ToolConverter<ToolType> {
    public convertFromTools(tools: Tool[]): ToolType[] {
        return tools
            .map(tn => this.convertFromTool(tn))
            .filter(item => item !== null && item !== undefined);
    }

    public abstract convertFromTool(tool: Tool): ToolType;

    public convertToTools(tools: ToolType[]): Tool[] {
        return tools
            .map(t => this.convertToTool(t))
            .filter(item => item !== null && item !== undefined);
    }

    public abstract convertToTool(tool: ToolType): Tool;
}

export interface PromptConverter<PromptType> {
    convertFromPrompts(prompts: Prompt[]): PromptType[];
    convertFromPrompt(prompt: Prompt): PromptType;
    convertToPrompts(prompts: PromptType[]): Prompt[];
    convertToPrompt(prompt: PromptType): Prompt;
}

export abstract class AbstractPromptConverter<PromptType> implements PromptConverter<PromptType> {
    public convertFromPrompts(prompts: Prompt[]): PromptType[] {
        return prompts
            .map(pn => this.convertFromPrompt(pn))
            .filter(item => item !== null && item !== undefined);
    }

    public abstract convertFromPrompt(prompt: Prompt): PromptType;

    public convertToPrompts(prompts: PromptType[]): Prompt[] {
        return prompts
            .map(p => this.convertToPrompt(p))
            .filter(item => item !== null && item !== undefined);
    }

    public abstract convertToPrompt(prompt: PromptType): Prompt;
}

export interface ResourceConverter<ResourceType> {
    convertFromResources(resources: Resource[]): ResourceType[];
    convertFromResource(resource: Resource): ResourceType;
    convertToResources(resources: ResourceType[]): Resource[];
    convertToResource(resource: ResourceType): Resource;
}

export abstract class AbstractResourceConverter<ResourceType> implements ResourceConverter<ResourceType> {
    public convertFromResources(resources: Resource[]): ResourceType[] {
        return resources
            .map(rn => this.convertFromResource(rn))
            .filter(item => item !== null && item !== undefined);
    }

    public abstract convertFromResource(resource: Resource): ResourceType;

    public convertToResources(resources: ResourceType[]): Resource[] {
        return resources
            .map(rn => this.convertToResource(rn))
            .filter(item => item !== null && item !== undefined);
    }

    public abstract convertToResource(resource: ResourceType): Resource;
}

export interface ToolAnnotationsConverter<ToolAnnotationsType> {
    convertFromToolAnnotations(toolAnnotations: ToolAnnotations[]): ToolAnnotationsType[];
    convertFromToolAnnotations(tool: ToolAnnotations): ToolAnnotationsType;
    convertToToolAnnotations(toolAnnotations: ToolAnnotationsType[]): ToolAnnotations[];
    convertToToolAnnotations(toolAnnotations: ToolAnnotationsType): ToolAnnotations;
}

export abstract class AbstractToolAnnotationsConverter<ToolAnnotationsType> implements ToolAnnotationsConverter<ToolAnnotationsType> {
    public convertFromToolAnnotations(toolAnnotations: ToolAnnotations[]): ToolAnnotationsType[];
    public convertFromToolAnnotations(tool: ToolAnnotations): ToolAnnotationsType;
    public convertFromToolAnnotations(toolAnnotationsOrArray: ToolAnnotations | ToolAnnotations[]): ToolAnnotationsType | ToolAnnotationsType[] {
        if (Array.isArray(toolAnnotationsOrArray)) {
            return toolAnnotationsOrArray
                .map(tn => this.convertFromToolAnnotationsSingle(tn))
                .filter(item => item !== null && item !== undefined);
        } else {
            return this.convertFromToolAnnotationsSingle(toolAnnotationsOrArray);
        }
    }

    protected abstract convertFromToolAnnotationsSingle(tool: ToolAnnotations): ToolAnnotationsType;

    public convertToToolAnnotations(toolAnnotations: ToolAnnotationsType[]): ToolAnnotations[];
    public convertToToolAnnotations(toolAnnotations: ToolAnnotationsType): ToolAnnotations;
    public convertToToolAnnotations(toolAnnotationsOrArray: ToolAnnotationsType | ToolAnnotationsType[]): ToolAnnotations | ToolAnnotations[] {
        if (Array.isArray(toolAnnotationsOrArray)) {
            return toolAnnotationsOrArray
                .map(t => this.convertToToolAnnotationsSingle(t))
                .filter(item => item !== null && item !== undefined);
        } else {
            return this.convertToToolAnnotationsSingle(toolAnnotationsOrArray);
        }
    }

    protected abstract convertToToolAnnotationsSingle(toolAnnotations: ToolAnnotationsType): ToolAnnotations;
}

