import { z } from 'zod';
import { BaseMetadataSchema } from '@modelcontextprotocol/sdk/types.js';

/**
 * Group schema definition
 */
export const GroupSchema: z.ZodType<GroupType> = z.lazy(() => BaseMetadataSchema.extend({
	
	description: z.optional(z.string()),

    parent: z.optional(z.ZodType<GroupSchema>),

    _meta: z.optional(z.object({}).passthrough())
}));

type GroupType = z.infer<typeof GroupSchema>;