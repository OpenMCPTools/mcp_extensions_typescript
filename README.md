# MCP Extensions — TypeScript

Extensions for the MCP (Model Context Protocol) TypeScript SDK.

## What's in here

The project defines a tree-based data model to organize **tools**, **prompts**, and **resources** into **hierarchical groups** — like folders inside folders.

### Core model (`src/Common.ts`)

- **Group** — a tree node. Can contain other groups, tools, prompts, and resources. Each group knows its parent and computes its fully qualified name (e.g. `com.example.api`).
- **Tool** — an MCP tool. Can belong to multiple groups at once.
- **Prompt** — an MCP prompt with typed arguments.
- **Resource** — an MCP resource (URI, size, MIME type).
- **Converter** — generic interface to convert between the internal model and any external format.

### Config (`src/GroupsExtensionConfig.ts`)

Extension identifier constants (`org.openmcptools/groups`).

### Schema (`src/GroupSchema.ts`)

Zod schema for group validation, built on top of the MCP SDK's `BaseMetadataSchema`.

## How to test

```bash
cd org.openmcptools.extensions.groups
npm install
npm test
```

Tests cover both happy paths (creation, hierarchy, relationships) and failure scenarios (invalid names, duplicate removals, re-additions, state consistency).
