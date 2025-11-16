import { z } from 'zod';

// Object types
export const ObjectTypeSchema = z.enum([
  'note',
  'task',
  'doc',
  'file',
  'person',
  'topic',
  'daily',
  'weekly',
  'email',
  'website',
]);
export type ObjectType = z.infer<typeof ObjectTypeSchema>;

// Tag kinds
export const TagKindSchema = z.enum(['simple', 'entity', 'security']);
export type TagKind = z.infer<typeof TagKindSchema>;

// Property value types
export const PropertyValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.null(),
]);
export type PropertyValue = z.infer<typeof PropertyValueSchema>;

// Tag reference (on items)
export const TagRefSchema = z.object({
  kind: TagKindSchema,
  key: z.string(), // slug
  label: z.string(),
  entityId: z.string().optional(),
});
export type TagRef = z.infer<typeof TagRefSchema>;

// Relation reference
export const RelationRefSchema = z.object({
  toId: z.string(),
  label: z.string().optional(),
  weight: z.number().optional(),
});
export type RelationRef = z.infer<typeof RelationRefSchema>;

// Document subtype for files
export const DocumentSubTypeSchema = z.enum([
  'metanote', // Native block-based editor
  'pdf',
  'docx',
  'xlsx',
  'pptx',
  'txt',
  'md',
  'email',
  'image',
  'other',
]);
export type DocumentSubType = z.infer<typeof DocumentSubTypeSchema>;

// Email-specific metadata
export interface EmailMetadata {
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  date: string;
  threadId?: string;
  hasAttachments?: boolean;
  isRead?: boolean;
  isStarred?: boolean;
}

// Main object schema
export const MNoteObjectSchema = z.object({
  id: z.string(),
  wsId: z.string(),
  collectionId: z.string().optional(), // Which collection schema this object belongs to
  type: ObjectTypeSchema,
  title: z.string(),
  icon: z.string().optional(),
  coverUrl: z.string().optional(),
  properties: z.record(z.string(), PropertyValueSchema).default({}),
  blockRootId: z.string().optional(),
  // File-specific fields
  documentSubType: DocumentSubTypeSchema.optional(), // for document collections
  fileUrl: z.string().optional(), // URL to uploaded file
  fileSize: z.number().optional(), // in bytes
  mimeType: z.string().optional(),
  // Email-specific (when type === 'email')
  emailMetadata: z.unknown().optional(), // EmailMetadata
  // Website-specific
  websiteUrl: z.string().optional(),
  websiteScreenshot: z.string().optional(),
  // Activity/Comments
  comments: z.array(z.unknown()).optional().default([]),
  activity: z.array(z.unknown()).optional().default([]),
  // Security
  securityTagId: z.string().optional(), // Override collection default
  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string(),
  relations: z.array(RelationRefSchema).optional().default([]),
  mentions: z.array(z.string()).optional().default([]),
  tags: z.array(TagRefSchema).optional().default([]),
  referenceTags: z.array(TagRefSchema).optional().default([]),
});
export type MNoteObject = z.infer<typeof MNoteObjectSchema>;

// Tag catalog entry
export const TagSchema = z.object({
  id: z.string(),
  wsId: z.string(),
  kind: TagKindSchema,
  label: z.string(),
  slug: z.string(),
  entityId: z.string().optional(), // for kind=entity
  parentId: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Tag = z.infer<typeof TagSchema>;

// Block types (Notion-style)
export const BlockTypeSchema = z.enum([
  'paragraph',
  'heading1',
  'heading2',
  'heading3',
  'bulletList',
  'numberedList',
  'todo',
  'code',
  'callout',
  'quote',
  'divider',
  'image',
  'embed',
  'toggle',
]);
export type BlockType = z.infer<typeof BlockTypeSchema>;

// Inline formatting
export const InlineFormatSchema = z.object({
  type: z.enum(['bold', 'italic', 'underline', 'strike', 'code', 'link', 'color', 'highlight']),
  start: z.number(),
  end: z.number(),
  value: z.string().optional(), // for color, link url, etc.
});
export type InlineFormat = z.infer<typeof InlineFormatSchema>;

// Block schema
export const BlockSchema = z.object({
  id: z.string(),
  parentId: z.string().nullable(),
  objectId: z.string(),
  type: BlockTypeSchema,
  attrs: z.record(z.string(), z.unknown()).optional(),
  text: z.string().optional(),
  formats: z.array(InlineFormatSchema).optional(), // Rich text formatting
  children: z.array(z.string()).default([]),
});
export type Block = z.infer<typeof BlockSchema>;

// View layout types
export const ViewLayoutSchema = z.enum(['table', 'kanban', 'gallery']);
export type ViewLayout = z.infer<typeof ViewLayoutSchema>;

// View config
export const ViewConfigSchema = z.object({
  id: z.string(),
  wsId: z.string(),
  name: z.string(),
  layout: ViewLayoutSchema,
  filter: z.unknown().optional(),
  sort: z.unknown().optional(),
  groupBy: z.string().nullable().optional(),
  columns: z.array(z.string()).optional(),
});
export type ViewConfig = z.infer<typeof ViewConfigSchema>;

// Block operations
export const BlockOpSchema = z.discriminatedUnion('op', [
  z.object({
    op: z.literal('add'),
    block: BlockSchema,
  }),
  z.object({
    op: z.literal('update'),
    id: z.string(),
    patch: z.record(z.string(), z.unknown()),
  }),
  z.object({
    op: z.literal('remove'),
    id: z.string(),
  }),
]);
export type BlockOp = z.infer<typeof BlockOpSchema>;

// Search result
export const SearchResultSchema = MNoteObjectSchema.extend({
  score: z.number().optional(),
  highlights: z.array(z.string()).optional(),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

// API response schemas
export const ObjectsResponseSchema = z.object({
  items: z.array(MNoteObjectSchema),
  total: z.number().optional(),
});

export const BlocksResponseSchema = z.object({
  blocks: z.array(BlockSchema),
});

export const ViewsResponseSchema = z.object({
  items: z.array(ViewConfigSchema),
});

export const TagsResponseSchema = z.object({
  items: z.array(TagSchema),
});

export const SearchResponseSchema = z.object({
  items: z.array(SearchResultSchema),
});

// Chunk schema (for RAG)
export const ChunkSchema = z.object({
  id: z.string(),
  text: z.string(),
  meta: z.object({
    objectId: z.string(),
    type: ObjectTypeSchema,
    tags: z.array(z.string()),
    updatedAt: z.string(),
  }),
  vector: z.array(z.number()).optional(),
});
export type Chunk = z.infer<typeof ChunkSchema>;

// Index entry (for global search)
export interface IndexEntry {
  id: string;
  wsId: string;
  title: string;
  tags: string[];
  referenceTags: string[];
  type: ObjectType;
  updatedAt: string;
  text: string;
}

// Collection Types
export const CollectionTypeSchema = z.enum(['document', 'item', 'task', 'email', 'website']);
export type CollectionType = z.infer<typeof CollectionTypeSchema>;

// Collection Property Types
export const PropertyTypeSchema = z.enum([
  'text',
  'number',
  'boolean',
  'date',
  'select',
  'multiselect', // New: multi-select from options
  'collection_ref',
]);
export type PropertyType = z.infer<typeof PropertyTypeSchema>;

export const CollectionPropertySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: PropertyTypeSchema,
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // for select type
  referencedCollectionId: z.string().optional(), // for collection_ref type
  isMultiSelect: z.boolean().optional(), // for collection_ref multi-select
  defaultValue: z.unknown().optional(),
});
export type CollectionProperty = z.infer<typeof CollectionPropertySchema>;

// Collection
export const CollectionSchema = z.object({
  id: z.string(),
  wsId: z.string(),
  name: z.string(),
  collectionType: CollectionTypeSchema, // document, item, or task
  icon: z.string().optional(),
  description: z.string().optional(),
  properties: z.array(CollectionPropertySchema).optional().default([]),
  filter: z
    .object({
      type: ObjectTypeSchema.optional(),
      tagSlugs: z.array(z.string()).optional(),
      properties: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Collection = z.infer<typeof CollectionSchema>;

export const CollectionsResponseSchema = z.object({
  items: z.array(CollectionSchema),
});

// Workspace
export interface Workspace {
  id: string;
  name: string;
  icon?: string;
}

// Filter types (for advanced filtering)
export type FilterOperator =
  | 'contains'
  | 'not_contains'
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'in'
  | 'not_in'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty';

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface FilterGroup {
  id: string;
  operator: 'AND' | 'OR';
  conditions: (FilterCondition | FilterGroup)[];
}

// Wiki types
export interface WikiPage {
  id: string;
  wsId: string;
  objectId: string;
  groupId: string | null;
  order: number;
  createdAt: string;
}

export interface WikiGroup {
  id: string;
  wsId: string;
  name: string;
  icon?: string;
  order: number;
  createdAt: string;
}
