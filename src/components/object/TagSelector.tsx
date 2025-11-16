import { useState } from 'react';
import { Check, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useTags, useCreateTag, useObjects, useCollections } from '@/lib/query';
import { cn } from '@/lib/utils';
import type { TagRef } from '@/lib/types';

interface TagSelectorProps {
  open: boolean;
  onClose: () => void;
  currentTags: TagRef[];
  onUpdate: (tags: TagRef[]) => void;
}

export function TagSelector({ open, onClose, currentTags, onUpdate }: TagSelectorProps) {
  const { data: tagsData } = useTags();
  const { data: objectsData } = useObjects();
  const { data: collectionsData } = useCollections();
  const createTag = useCreateTag();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

  const allTags = tagsData?.items || [];
  const objects = objectsData?.items || [];
  const collections = collectionsData?.items || [];
  const currentTagKeys = new Set(currentTags.map((t) => t.key));

  const toggleGroup = (tagId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(tagId)) {
      newExpanded.delete(tagId);
    } else {
      newExpanded.add(tagId);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleCollection = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  const toggleTag = (tag: (typeof allTags)[0]) => {
    if (currentTagKeys.has(tag.slug)) {
      // Remove tag
      const newTags = currentTags.filter((t) => t.key !== tag.slug);
      onUpdate(newTags);
    } else {
      // Add tag
      const newTag: TagRef = {
        kind: tag.kind,
        key: tag.slug,
        label: tag.label,
        entityId: tag.entityId,
      };
      onUpdate([...currentTags, newTag]);
    }
  };

  const handleCreateNewTag = async () => {
    if (!searchQuery.trim()) return;

    const newTag = await createTag.mutateAsync({ label: searchQuery });

    // Auto-add the newly created tag
    const tagRef: TagRef = {
      kind: 'simple',
      key: newTag.item.slug,
      label: newTag.item.label,
    };
    onUpdate([...currentTags, tagRef]);
    setSearchQuery('');
  };

  const simpleTags = allTags.filter((t) => t.kind === 'simple');
  const entityTags = allTags.filter((t) => t.kind === 'entity');

  const filteredSimpleTags = simpleTags.filter((tag) =>
    tag.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEntityTags = entityTags.filter((tag) =>
    tag.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canCreateNew =
    searchQuery.trim() && !allTags.some((t) => t.label.toLowerCase() === searchQuery.toLowerCase());

  // Group simple tags by parent
  const rootTags = filteredSimpleTags.filter((t) => !t.parentId);
  const getChildren = (parentId: string) =>
    filteredSimpleTags.filter((t) => t.parentId === parentId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>Add or remove tags from this object</DialogDescription>
        </DialogHeader>

        <Command className="border rounded-lg">
          <CommandInput
            placeholder="Search or create tags..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <ScrollArea className="max-h-[400px]">
            <CommandList>
              {filteredSimpleTags.length === 0 &&
                filteredEntityTags.length === 0 &&
                !canCreateNew && <CommandEmpty>No tags found.</CommandEmpty>}

              {canCreateNew && (
                <CommandGroup heading="Create New">
                  <CommandItem onSelect={handleCreateNewTag}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Create "{searchQuery}"</span>
                  </CommandItem>
                </CommandGroup>
              )}

              {filteredSimpleTags.length > 0 && (
                <CommandGroup heading="Simple Tags">
                  {rootTags.map((tag) => (
                    <TagItemWithChildren
                      key={tag.id}
                      tag={tag}
                      children={getChildren(tag.id)}
                      isSelected={currentTagKeys.has(tag.slug)}
                      isExpanded={expandedGroups.has(tag.id)}
                      onToggle={() => toggleTag(tag)}
                      onToggleExpand={() => toggleGroup(tag.id)}
                    />
                  ))}
                </CommandGroup>
              )}

              {filteredEntityTags.length > 0 && (
                <CommandGroup heading="Entity Tags">
                  {/* Group by collection in hierarchy */}
                  {Object.entries(
                    filteredEntityTags.reduce((acc: any, tag) => {
                      const entity = objects.find((o) => o.id === tag.entityId);
                      const collection = collections.find((c) => c.id === entity?.collectionId);
                      const collectionId = collection?.id || 'other';
                      const collectionName = collection?.name || 'Other';
                      if (!acc[collectionId]) {
                        acc[collectionId] = {
                          name: collectionName,
                          icon: collection?.icon || '📁',
                          tags: [],
                        };
                      }
                      acc[collectionId].tags.push(tag);
                      return acc;
                    }, {})
                  ).map(([collectionId, group]: [string, any]) => (
                    <div key={collectionId}>
                      {/* Collection header - collapsible */}
                      <CommandItem onSelect={() => toggleCollection(collectionId)}>
                        <ChevronRight
                          className={cn(
                            'mr-2 h-3 w-3 transition-transform',
                            expandedCollections.has(collectionId) && 'rotate-90'
                          )}
                        />
                        <span className="text-xs">{group.icon}</span>
                        <span className="ml-2 font-medium">{group.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          ({group.tags.length})
                        </span>
                      </CommandItem>

                      {/* Entity tags under collection */}
                      {expandedCollections.has(collectionId) && (
                        <div className="ml-6">
                          {group.tags.map((tag: any) => {
                            const isSelected = currentTagKeys.has(tag.slug);
                            return (
                              <CommandItem key={tag.id} onSelect={() => toggleTag(tag)}>
                                <div
                                  className={cn(
                                    'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                    isSelected
                                      ? 'bg-primary text-primary-foreground'
                                      : 'opacity-50 [&_svg]:invisible'
                                  )}
                                >
                                  <Check className="h-4 w-4" />
                                </div>
                                <span className="text-primary text-sm">{tag.label}</span>
                              </CommandItem>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </ScrollArea>
        </Command>

        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TagItemWithChildrenProps {
  tag: { id: string; label: string; slug: string; parentId?: string | null };
  children: Array<{ id: string; label: string; slug: string; parentId?: string | null }>;
  isSelected: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onToggleExpand: () => void;
}

function TagItemWithChildren({
  tag,
  children,
  isSelected,
  isExpanded,
  onToggle,
  onToggleExpand,
}: TagItemWithChildrenProps) {
  const hasChildren = children.length > 0;

  return (
    <div>
      <CommandItem onSelect={onToggle} className="flex items-center">
        <div
          className={cn(
            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
            isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
          )}
        >
          <Check className="h-4 w-4" />
        </div>
        <span className="flex-1">{tag.label}</span>
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="ml-1"
          >
            <ChevronRight
              className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-90')}
            />
          </button>
        )}
      </CommandItem>
      {hasChildren && isExpanded && (
        <div className="ml-6">
          {children.map((child) => {
            const childSelected = isSelected;
            return (
              <CommandItem key={child.id} onSelect={onToggle}>
                <div
                  className={cn(
                    'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                    childSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'opacity-50 [&_svg]:invisible'
                  )}
                >
                  <Check className="h-4 w-4" />
                </div>
                <span className="text-sm">{child.label}</span>
              </CommandItem>
            );
          })}
        </div>
      )}
    </div>
  );
}
