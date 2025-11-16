import type { Tag } from '../../../../lib/types';
import { listTags } from '../../../../mockData/mockdb';
import { apiSlice } from '../../../api/apiSlice';

const localTags = listTags('ws_default'); // mutable local database (mock)

export const tagsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL TAGS (LOCAL)
    getTags: builder.query<Tag[], void>({
      async queryFn() {
        return { data: localTags };
      },
    }),

    // GET BY ID
    getTagById: builder.query<Tag | undefined, string>({
      async queryFn(id) {
        const tag = localTags.find((t) => t.id === id);
        return { data: tag };
      },
    }),

    // CREATE (LOCAL)
    createTag: builder.mutation<Tag, Partial<Tag>>({
      async queryFn(newTag) {
        const tag: Tag = {
          ...newTag,
          id: `tag_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          wsId: 'ws_default',
          kind: newTag.kind ?? 'simple',
          parentId: newTag.parentId ?? null,
        } as Tag;

        localTags.push(tag);

        return { data: tag };
      },
    }),

    // UPDATE
    updateTag: builder.mutation<Tag, { id: string; updates: Partial<Tag> }>({
      async queryFn({ id, updates }) {
        const index = localTags.findIndex((t) => t.id === id);
        if (index === -1) return { data: undefined };

        localTags[index] = {
          ...localTags[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        return { data: localTags[index] };
      },
    }),

    // DELETE
    deleteTag: builder.mutation<string, string>({
      async queryFn(id) {
        const index = localTags.findIndex((t) => t.id === id);
        if (index === -1) return { data: 'not_found' };

        localTags.splice(index, 1);
        return { data: 'deleted' };
      },
    }),
  }),
});

export const {
  useGetTagsQuery,
  useGetTagByIdQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = tagsApi;
