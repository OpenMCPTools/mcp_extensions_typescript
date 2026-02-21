import { z } from 'zod';
import { BaseMetadataSchema } from '@modelcontextprotocol/sdk/types.js';

/**
 * Zod schema for a Group node.
 * Uses `z.lazy` for the recursive `parent` reference.
 */
export const GroupSchema: z.ZodType = z.lazy(() =>
  BaseMetadataSchema.extend({
    description: z.string().optional(),
    parent: GroupSchema.optional(),
    _meta: z.record(z.string(), z.unknown()).optional(),
  }),
);

export type GroupType = z.infer<typeof GroupSchema>;