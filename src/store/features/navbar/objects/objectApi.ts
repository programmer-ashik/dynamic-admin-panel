import type { MNoteObject } from '../../../../lib/types';
import { listObjects } from '../../../../mockData/mockdb';
import { apiSlice } from '../../../api/apiSlice';

let mockObjects = listObjects('ws_default');
export const objectApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL OBJECTS
    getObjects: builder.query<MNoteObject[], void>({
      async queryFn() {
        return { data: mockObjects };
      },
      providesTags: ['Objects'],
    }),

    // GET SINGLE BY ID
    getObjectById: builder.query<MNoteObject | undefined, string>({
      async queryFn(id) {
        const obj = mockObjects.find((o) => o.id === id);
        return { data: obj };
      },
      providesTags: (_, __, id) => [{ type: 'Objects', id }],
    }),

    // CREATE
    createObject: builder.mutation<MNoteObject, Partial<MNoteObject>>({
      async queryFn(newObj) {
        const obj: MNoteObject = {
          ...newObj,
          id: 'obj_' + Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as MNoteObject;

        mockObjects.push(obj);
        return { data: obj };
      },
      invalidatesTags: ['Objects'],
    }),

    // UPDATE
    // updateObject: builder.mutation<MNoteObject, UpdateObjectPayload>({
    //   async queryFn({ id, data }) {
    //     const index = mockObjects.findIndex((o) => o.id === id);
    //     if (index === -1) return { error: { status: 404 } as any };

    //     mockObjects[index] = {
    //       ...mockObjects[index],
    //       ...data,
    //       updatedAt: new Date().toISOString(),
    //     };

    //     return { data: mockObjects[index] };
    //   },
    //   invalidatesTags: (_, __, { id }) => [{ type: "Objects", id }],
    // }),

    // DELETE
    deleteObject: builder.mutation<{ id: string }, string>({
      async queryFn(id) {
        const index = mockObjects.findIndex((o) => o.id === id);
        if (index !== -1) mockObjects.splice(index, 1);
        return { data: { id } };
      },
      invalidatesTags: ['Objects'],
    }),
  }),
});

export const {
  useGetObjectsQuery,
  useGetObjectByIdQuery,
  useCreateObjectMutation,
  //   useUpdateObjectMutation,
  useDeleteObjectMutation,
} = objectApi;
