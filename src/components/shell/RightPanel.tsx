import { useSearchParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/store';
import { useObject, useObjects, useCollections } from '@/lib/query';
import {
  Sparkles,
  Link as LinkIcon,
  Settings,
  Database,
  FileText,
  ListChecks,
  ChevronRight,
  X,
} from 'lucide-react';
import { TagChips } from '@/components/common/TagChips';
import { EditableProperty } from './EditableProperty';
import { CommentThread } from '@/components/activity/CommentThread';
import { ActivityFeed, type ActivityItem } from '@/components/activity/ActivityFeed';
import { formatRelativeDate } from '@/lib/utils';

export function RightPanel() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const selectedObjectId = useUIStore((state) => state.selectedObjectId);
  const setSelectedObjectId = useUIStore((state) => state.setSelectedObjectId);
  const { data: objectData } = useObject(selectedObjectId || '');
  const { data: allObjects } = useObjects();
  const { data: collectionsData } = useCollections();

  const obj = objectData?.item;
  const collections = collectionsData?.items || [];
  const currentCollectionId = searchParams.get('collectionId');
  const currentCollection = collections.find((c) => c.id === currentCollectionId);

  // Reset selected object when navigating to different pages (not within workspace home)
  useEffect(() => {
    if (
      location.pathname.includes('/graph') ||
      location.pathname.includes('/tags') ||
      location.pathname.includes('/wiki') ||
      location.pathname.includes('/ai')
    ) {
      setSelectedObjectId(null);
    }
  }, [location.pathname, setSelectedObjectId]);

  // Show collection info if collection is selected but no object
  if (!obj && currentCollection) {
    return <CollectionInfoPanel collection={currentCollection} objects={allObjects?.items || []} />;
  }

  if (!obj) {
    return (
      <div className="flex h-full items-center justify-center border-l bg-card p-4">
        <p className="text-sm text-muted-foreground text-center">
          Select an object or collection to view details
        </p>
      </div>
    );
  }

  // Find backlinks (objects that mention or relate to this one)
  const backlinks =
    allObjects?.items.filter(
      (item) =>
        item.id !== obj.id &&
        (item.mentions?.includes(obj.id) || item.relations?.some((r) => r.toId === obj.id))
    ) || [];

  return (
    <div className="flex h-full flex-col border-l bg-card">
      <Tabs defaultValue="properties" className="flex-1 flex flex-col">
        <div className="border-b px-4 pt-2 pb-1">
          <div className="flex items-center justify-between mb-1">
            <TabsList className="grid grid-cols-4 flex-1 mr-2">
              <TabsTrigger value="properties" className="text-xs">
                <Settings className="mr-1 h-3 w-3" />
                Info
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs">
                <LinkIcon className="mr-1 h-3 w-3" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="backlinks" className="text-xs">
                <LinkIcon className="mr-1 h-3 w-3" />
                Related
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs">
                <Sparkles className="mr-1 h-3 w-3" />
                AI
              </TabsTrigger>
            </TabsList>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const toggleRightPanel = useUIStore.getState().toggleRightPanel;
                toggleRightPanel();
              }}
              className="h-7 w-7"
              title="Close properties"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="properties" className="m-0 p-4">
            <div className="space-y-4">
              {/* Basic info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Basic Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Type</div>
                    <div className="capitalize">{obj.type}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Created</div>
                    <div>{formatRelativeDate(obj.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Updated</div>
                    <div>{formatRelativeDate(obj.updatedAt)}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              {obj.tags && obj.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TagChips tags={obj.tags} />
                  </CardContent>
                </Card>
              )}

              {/* Reference Tags */}
              {obj.referenceTags && obj.referenceTags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Reference Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TagChips tags={obj.referenceTags} />
                  </CardContent>
                </Card>
              )}

              {/* Properties */}
              {obj.properties &&
                Object.keys(obj.properties).filter(
                  (k) => k !== 'content' && k !== 'body' && k !== 'Description'
                ).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Custom Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(obj.properties)
                        .filter(
                          ([key]) => key !== 'content' && key !== 'body' && key !== 'Description'
                        )
                        .map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <div className="text-xs text-muted-foreground capitalize font-medium">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <EditableProperty
                              propertyKey={key}
                              value={value}
                              objectId={obj.id}
                              allProperties={obj.properties || {}}
                            />
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="m-0 p-4 space-y-6">
            {/* Activity Feed */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                Activity Log
              </h4>
              <ActivityFeed activities={(obj as any).activity || []} />
            </div>

            {/* Comments */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                Comments
              </h4>
              <CommentThread
                comments={(obj as any).comments || []}
                onAddComment={(comment) => {
                  console.log('Add comment:', comment);
                }}
                onTagClick={(tagId) => {
                  window.location.href = `#/w/${obj.wsId}/object/${tagId}`;
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="backlinks" className="m-0 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Related Items</h4>
              {obj.tags && obj.tags.length > 0 && (
                <button
                  onClick={() => {
                    const tagSlug = obj.tags![0].key; // Use first tag
                    window.location.href = `/w/${obj.wsId}/collections?tagSlugs=${tagSlug}`;
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  See all with this tag →
                </button>
              )}
            </div>
            <div className="space-y-2">
              {backlinks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No related items found</p>
              ) : (
                backlinks.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => {
                      const setSelectedObjectId = useUIStore.getState().setSelectedObjectId;
                      setSelectedObjectId(item.id);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon || '📄'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-sm">{item.title}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {item.type}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="ai" className="m-0 p-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">AI features coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

interface CollectionInfoPanelProps {
  collection: {
    id: string;
    name: string;
    icon?: string;
    description?: string;
    collectionType: string;
    properties?: Array<{
      id: string;
      name: string;
      type: string;
      required: boolean;
      options?: string[];
    }>;
    createdAt: string;
    updatedAt: string;
  };
  objects: Array<{ collectionId?: string }>;
}

function CollectionInfoPanel({ collection, objects }: CollectionInfoPanelProps) {
  const itemCount = objects.filter((o) => o.collectionId === collection.id).length;

  const collectionTypeIcons = {
    document: FileText,
    item: Database,
    task: ListChecks,
  };

  const TypeIcon =
    collectionTypeIcons[collection.collectionType as keyof typeof collectionTypeIcons] || Database;

  return (
    <div className="flex h-full flex-col border-l bg-card">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{collection.icon || '📁'}</span>
              <div>
                <h2 className="text-xl font-semibold">{collection.name}</h2>
                <p className="text-sm text-muted-foreground capitalize flex items-center gap-1">
                  <TypeIcon className="h-3 w-3" />
                  {collection.collectionType} collection
                </p>
              </div>
            </div>

            {collection.description && (
              <p className="text-sm text-muted-foreground">{collection.description}</p>
            )}
          </div>

          <Separator />

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Items</span>
                <Badge variant="secondary">{itemCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Properties</span>
                <Badge variant="secondary">{collection.properties?.length || 0}</Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Created</div>
                <div className="mt-1">{formatRelativeDate(collection.createdAt)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Updated</div>
                <div className="mt-1">{formatRelativeDate(collection.updatedAt)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Schema */}
          {collection.properties && collection.properties.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Schema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {collection.properties.map((prop) => (
                  <div key={prop.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {prop.name}
                        {prop.required && <span className="text-destructive ml-1">*</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] h-5">
                        {prop.type.replace('_', ' ')}
                      </Badge>
                      {prop.options && (
                        <span className="truncate">
                          {prop.options.slice(0, 3).join(', ')}
                          {prop.options.length > 3 && '...'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Type Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Collection Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <TypeIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium capitalize">{collection.collectionType}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {collection.collectionType === 'document' &&
                      'Long-form content with rich text or file uploads'}
                    {collection.collectionType === 'item' &&
                      'Structured records with custom properties'}
                    {collection.collectionType === 'task' && 'Workflow items with status tracking'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
