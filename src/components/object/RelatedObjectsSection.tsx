import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useObjects } from '@/lib/query';
import { useUIStore } from '@/lib/store';
import { formatRelativeDate } from '@/lib/utils';
import type { TagRef } from '@/lib/types';

interface RelatedObjectsSectionProps {
  objectId: string;
  wsId: string;
  tags?: TagRef[];
}

export function RelatedObjectsSection({ objectId, wsId, tags }: RelatedObjectsSectionProps) {
  const navigate = useNavigate();
  const { data: objectsData } = useObjects({ wsId });
  const setSelectedObjectId = useUIStore((state) => state.setSelectedObjectId);
  const allObjects = objectsData?.items || [];

  // Get current object to access its tags
  const currentObject = allObjects.find((o) => o.id === objectId);
  const currentTags = currentObject
    ? [...(currentObject.tags || []), ...(currentObject.referenceTags || [])]
    : [];
  const currentTagKeys = new Set(currentTags.map((t) => t.key));

  // Find related objects through multiple mechanisms:
  // 1. Direct mentions or relations (first-degree)
  // 2. Shared tags (second-degree)
  const relatedItems = allObjects.filter((item) => {
    if (item.id === objectId) return false;

    // First-degree: Direct mentions or relations
    const hasDirectRelation =
      item.mentions?.includes(objectId) || item.relations?.some((r) => r.toId === objectId);

    if (hasDirectRelation) return true;

    // Second-degree: Shared tags (both direct and reference tags)
    const itemTags = [...(item.tags || []), ...(item.referenceTags || [])];
    const itemTagKeys = new Set(itemTags.map((t) => t.key));

    // Check for any shared tags
    for (const tagKey of currentTagKeys) {
      if (itemTagKeys.has(tagKey)) {
        return true;
      }
    }

    return false;
  });

  if (relatedItems.length === 0 && (!tags || tags.length === 0)) {
    return null;
  }

  // Determine how to filter "See all"
  const entityTags = tags?.filter((t) => t.kind === 'entity') || [];
  const simpleTags = tags?.filter((t) => t.kind === 'simple') || [];

  // Prefer entity tags, fall back to simple tags
  const filterTags = entityTags.length > 0 ? entityTags : simpleTags;
  const hasFilterableTags = filterTags.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Related Items
            {relatedItems.length > 0 && (
              <span className="text-xs text-muted-foreground font-normal">
                ({relatedItems.length})
              </span>
            )}
          </div>
          {hasFilterableTags && (
            <button
              onClick={() => {
                // Use entity tags if available, otherwise simple tags
                const tagSlugs = filterTags.map((t) => t.key).join(',');
                console.log('Navigating with tag slugs:', tagSlugs, 'Tags:', filterTags);
                navigate(`/w/${wsId}/collections?tagSlugs=${tagSlugs}`, { replace: false });
              }}
              className="text-xs text-primary hover:underline font-normal"
              title={`Filter by: ${filterTags.map((t) => t.label).join(', ')}`}
            >
              See all ({filterTags.length} tags) →
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {relatedItems.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">No related items yet</p>
        ) : (
          <div className="space-y-2">
            {relatedItems.slice(0, 3).map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedObjectId(item.id)}
                className="w-full p-2 border rounded-md hover:bg-accent/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.icon || '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-xs">{item.title}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {item.type} • {formatRelativeDate(item.updatedAt)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {relatedItems.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{relatedItems.length - 3} more
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
