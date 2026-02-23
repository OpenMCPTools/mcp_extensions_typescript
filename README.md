# MCP Extensions — TypeScript

Extensions for the MCP (Model Context Protocol) TypeScript SDK.

## Server-Side Grouping

The [org.openmcptools.extensions.groups](https://github.com/OpenMCPTools/mcp_extensions_typescript/tree/main/org.openmcptools.extensions.groups) module provides an MCP extension to support hierarchical server-side grouping based upon the [typescript sdk](https://github.com/modelcontextprotocol/typescript-sdk).

### What's in here

The project defines a tree-based data model to organize **tools**, **prompts**, and **resources** into **hierarchical groups** — like folders inside folders.

#### Core model (`src/Common.ts`)

- **Group** — a tree node. Can contain other groups, tools, prompts, and resources. Each group knows its parent and computes its fully qualified name (e.g. `com.example.api`).
- **Tool** — an MCP tool. Can belong to multiple groups at once.
- **Prompt** — an MCP prompt with typed arguments.
- **Resource** — an MCP resource (URI, size, MIME type).
- **Converter** — generic interface to convert between the internal model and any external format.

#### Config (`src/GroupsExtensionConfig.ts`)

Extension identifier constants (`org.openmcptools/groups`).

#### Schema (`src/GroupSchema.ts`)

Zod schema for group validation, built on top of the MCP SDK's `BaseMetadataSchema`.

This javascript schema implementation is based upon this json-schema

```json
        "Group": {
            "properties": {
                "name": {
                    "type": "string"
                },
                "parent": {
                    "$ref": "#/definitions/Group",
                },
                "description": {
                    "type": "string"
                },
                "title": {
                    "type": "string"
                },
                "_meta": {
                    "additionalProperties": {},
                    "description": "See [General fields: `_meta`](/specification/draft/basic/index#meta) for notes on `_meta` usage.",
                    "type": "object"
                }
            },
            "required": [
                "name"
            ],
            "type": "object"
        }
```
This schema for hierarchical grouping was [initially proposed as a MCP protocol enhancement](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/1567#discussioncomment-14608597)

The same schema is used for the [mcp_extensions_java group extension](https://github.com/OpenMCPTools/mcp_extensions_java/tree/main/org.openmcptools.extensions.groups) (Java SDK) and the [mcp_extensions_python group extension](https://github.com/OpenMCPTools/mcp_extensions_python/tree/main/org.openmcptools.extensions.groups) (Python SDK)

### How to test

```bash
cd org.openmcptools.extensions.groups
npm install
npm test
```
Tests cover both happy paths (creation, hierarchy, relationships) and failure scenarios (invalid names, duplicate removals, re-additions, state consistency).
