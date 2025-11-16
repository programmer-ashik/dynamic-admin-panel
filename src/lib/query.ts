import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';

import type {
  MNoteObject,
  Block,
  ViewConfig,
  Tag,
  BlockOp,
  SearchResult,
  Collection,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Create query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Query keys
export const queryKeys = {
  objects: (params?: Record<string, unknown>) => ['objects', params],
  object: (id: string) => ['object', id],
  blocks: (objectId: string) => ['blocks', objectId],
  views: () => ['views'],
  tags: () => ['tags'],
  collections: () => ['collections'],
  search: (params: Record<string, unknown>) => ['search', params],
};

// API functions
async function fetchObjects(params?: {
  wsId?: string;
  q?: string;
  type?: string;
  viewId?: string;
  tagSlugs?: string[];
}): Promise<{ items: MNoteObject[] }> {
  const query = new URLSearchParams();
  if (params?.wsId) query.set('wsId', params.wsId);
  if (params?.q) query.set('q', params.q);
  if (params?.type) query.set('type', params.type);
  if (params?.viewId) query.set('viewId', params.viewId);
  if (params?.tagSlugs) query.set('tagSlugs', params.tagSlugs.join(','));

  const url = `${API_BASE}/objects${query.toString() ? `?${query}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch objects');
  return res.json();
}

async function fetchObject(id: string): Promise<{ item: MNoteObject }> {
  const res = await fetch(`${API_BASE}/objects/${id}`);
  if (!res.ok) throw new Error('Failed to fetch object');
  return res.json();
}

async function createObject(data: Partial<MNoteObject>): Promise<{ item: MNoteObject }> {
  const res = await fetch(`${API_BASE}/objects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create object');
  return res.json();
}

async function updateObject(
  id: string,
  patch: Partial<MNoteObject>
): Promise<{ item: MNoteObject }> {
  const res = await fetch(`${API_BASE}/objects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patch }),
  });
  if (!res.ok) throw new Error('Failed to update object');
  return res.json();
}

async function deleteObject(id: string): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_BASE}/objects/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete object');
  return res.json();
}

async function fetchBlocks(objectId: string): Promise<{ blocks: Block[] }> {
  const res = await fetch(`${API_BASE}/blocks/${objectId}`);
  if (!res.ok) throw new Error('Failed to fetch blocks');
  return res.json();
}

async function patchBlocks(objectId: string, ops: BlockOp[]): Promise<{ blocks: Block[] }> {
  const res = await fetch(`${API_BASE}/blocks/${objectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ops }),
  });
  if (!res.ok) throw new Error('Failed to patch blocks');
  return res.json();
}

async function fetchViews(): Promise<{ items: ViewConfig[] }> {
  const res = await fetch(`${API_BASE}/views`);
  if (!res.ok) throw new Error('Failed to fetch views');
  return res.json();
}

async function fetchTags(): Promise<{ items: Tag[] }> {
  const res = await fetch(`${API_BASE}/tags`);
  if (!res.ok) throw new Error('Failed to fetch tags');
  return res.json();
}

async function createTag(data: { label: string; parentId?: string }): Promise<{ item: Tag }> {
  const res = await fetch(`${API_BASE}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create tag');
  return res.json();
}

async function search(params: {
  wsId: string;
  q: string;
  filters?: Record<string, unknown>;
}): Promise<{ items: SearchResult[] }> {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to search');
  return res.json();
}

async function fetchCollections(): Promise<{ items: Collection[] }> {
  const res = await fetch(`${API_BASE}/collections`);
  if (!res.ok) throw new Error('Failed to fetch collections');
  return res.json();
}

async function createCollection(data: Partial<Collection>): Promise<{ item: Collection }> {
  const res = await fetch(`${API_BASE}/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create collection');
  return res.json();
}

async function updateCollection(
  id: string,
  patch: Partial<Collection>
): Promise<{ item: Collection }> {
  const res = await fetch(`${API_BASE}/collections/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patch }),
  });
  if (!res.ok) throw new Error('Failed to update collection');
  return res.json();
}

async function deleteCollection(id: string): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_BASE}/collections/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete collection');
  return res.json();
}

// Query hooks
export function useObjects(params?: {
  wsId?: string;
  q?: string;
  type?: string;
  viewId?: string;
  tagSlugs?: string[];
}) {
  return useQuery({
    queryKey: queryKeys.objects(params),
    queryFn: () => fetchObjects(params),
  });
}

export function useObject(id: string) {
  return useQuery({
    queryKey: queryKeys.object(id),
    queryFn: () => fetchObject(id),
    enabled: !!id,
  });
}

export function useBlocks(objectId: string) {
  return useQuery({
    queryKey: queryKeys.blocks(objectId),
    queryFn: () => fetchBlocks(objectId),
    enabled: !!objectId,
  });
}

export function useViews() {
  return useQuery({
    queryKey: queryKeys.views(),
    queryFn: fetchViews,
  });
}

export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags(),
    queryFn: fetchTags,
  });
}

export function useSearch(params: { wsId: string; q: string; filters?: Record<string, unknown> }) {
  return useQuery({
    queryKey: queryKeys.search(params),
    queryFn: () => search(params),
    enabled: params.q.length > 0,
  });
}

export function useCollections() {
  return useQuery({
    queryKey: queryKeys.collections(),
    queryFn: fetchCollections,
  });
}

// Mutation hooks
export function useCreateObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createObject,
    onMutate: async (newObject) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.objects() });
      const previousObjects = queryClient.getQueryData(queryKeys.objects());

      queryClient.setQueryData(queryKeys.objects(), (old: { items: MNoteObject[] } | undefined) => {
        if (!old) return old;
        return {
          items: [
            {
              id: 'temp-' + Date.now(),
              wsId: newObject.wsId || 'ws_default',
              type: newObject.type || 'note',
              title: newObject.title || 'Untitled',
              properties: {},
              tags: [],
              referenceTags: [],
              relations: [],
              mentions: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              ...newObject,
            },
            ...old.items,
          ],
        };
      });

      return { previousObjects };
    },
    onError: (err, newObject, context) => {
      if (context?.previousObjects) {
        queryClient.setQueryData(queryKeys.objects(), context.previousObjects);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.objects() });
    },
  });
}

export function useUpdateObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<MNoteObject> }) =>
      updateObject(id, patch),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.object(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.objects() });
    },
  });
}

export function useDeleteObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteObject,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.objects() });
      queryClient.removeQueries({ queryKey: queryKeys.object(id) });
      queryClient.removeQueries({ queryKey: queryKeys.blocks(id) });
    },
  });
}

export function usePatchBlocks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectId, ops }: { objectId: string; ops: BlockOp[] }) =>
      patchBlocks(objectId, ops),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.blocks(variables.objectId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.object(variables.objectId) });
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags() });
    },
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections() });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections() });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Collection> }) =>
      updateCollection(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections() });
    },
  });
}
