import type { Collection } from '../../../../lib/types';
import { menu } from '../../../../shared/constant/menu.constant';

import { apiSlice } from '../../../api/apiSlice';

let localCollections = menu;
export const localCollectionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCollectionsLocal: builder.query<Collection[], void>({
      async queryFn() {
        return { data: localCollections };
      },
      providesTags: ['Collections'],
    }),

    createCollectionLocal: builder.mutation<Collection, Partial<Collection>>({
      async queryFn(newItem) {
        const newCollection: Collection = {
          ...newItem,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Collection;

        localCollections.push(newCollection);
        return { data: newCollection };
      },
      invalidatesTags: ['Collections'],
    }),

    deleteCollectionLocal: builder.mutation<{ success: boolean }, string>({
      async queryFn(id) {
        localCollections = localCollections.filter((c) => c.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['Collections'],
    }),
  }),
});

export const {
  useGetCollectionsLocalQuery,
  useCreateCollectionLocalMutation,
  useDeleteCollectionLocalMutation,
} = localCollectionsApi;
