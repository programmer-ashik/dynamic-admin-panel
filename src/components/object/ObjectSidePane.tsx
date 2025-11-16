import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/lib/store';
import {
  getVersionHistory,
  getLatestVersion,
  createVersion,
  getDocumentLock,
  lockDocument,
  unlockDocument,
  canEditDocument,
  type DocumentVersion,
} from '@/lib/versioning';
import {
  X,
  Edit,
  ExternalLink,
  Tag as TagIcon,
  Plus,
  MoreVertical,
  BookMarked,
  PanelRightClose,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  GitBranch,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { EmailViewer } from '@/components/viewers/EmailViewer';
import { WebsiteViewer } from '@/components/viewers/WebsiteViewer';
import { PropertyDisplay } from '@/components/viewers/PropertyDisplay';
import { RelatedObjectsSection } from './RelatedObjectsSection';
import { TagChips } from '../common/TagChips';
import { TagSelector } from './TagSelector';
import { SecurityTagIndicator } from '@/components/security/SecurityTagIndicator';
import { SecurityTagSelector } from '@/components/security/SecurityTagSelector';
import { VersionHistory } from '@/components/versioning/VersionHistory';
import { DocumentLockIndicator } from '@/components/versioning/DocumentLockIndicator';
import { CreateMajorVersionDialog } from '@/components/versioning/CreateMajorVersionDialog';
import { useObject, useUpdateObject, useCollections, useTags } from '@/lib/query';
import { useToast } from '@/components/ui/use-toast';
import { addToWiki, listWikiPages } from '@/lib/mockdb';
import { formatRelativeDate, generateId } from '@/lib/utils';

interface ObjectSidePaneProps {
  objectId: string;
  onClose: () => void;
  onOpenFull: () => void;
}

export function ObjectSidePane({ objectId, onClose, onOpenFull }: ObjectSidePaneProps) {
  const navigate = useNavigate();
  const { wsId = 'ws_default' } = useParams();
  const { data: objectData, isLoading } = useObject(objectId);
  const { data: collectionsData } = useCollections();
  const { data: tagsData } = useTags();
  const updateObject = useUpdateObject();
  const toggleRightPanel = useUIStore((state) => state.toggleRightPanel);
  const rightPanelOpen = useUIStore((state) => state.rightPanelOpen);
  const navigateToObject = useUIStore((state) => state.navigateToObject);
  const navigateBack = useUIStore((state) => state.navigateBack);
  const navigateForward = useUIStore((state) => state.navigateForward);
  const canGoBack = useUIStore((state) => state.canGoBack);
  const canGoForward = useUIStore((state) => state.canGoForward);
  const setSelectedObjectId = useUIStore((state) => state.setSelectedObjectId);
  const { toast } = useToast();

  const obj = objectData?.item;
  const collections = collectionsData?.items || [];
  const tags = tagsData?.items || [];
  const currentCollection = collections.find((c) => c.id === obj?.collectionId);

  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [content, setContent] = useState('');
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [showSecuritySelector, setShowSecuritySelector] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showMajorVersionDialog, setShowMajorVersionDialog] = useState(false);

  // Versioning state
  const currentUser = 'Liam Trampota'; // In real app, get from auth
  const versions = getVersionHistory(obj?.id || '');
  const latestVersion = getLatestVersion(obj?.id || '');
  const documentLock = getDocumentLock(obj?.id || '');
  const editPermission = canEditDocument(obj?.id || '', currentUser);

  // Auto-save timer for minor versions
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  // Check if already in wiki
  const wikiPages = listWikiPages(wsId);
  const isInWiki = obj ? wikiPages.some((p) => p.objectId === obj.id) : false;

  const isNativeDoc = !obj?.documentSubType || obj?.documentSubType === 'metanote';
  const isUploadedFile = obj?.documentSubType && obj?.documentSubType !== 'metanote';

  useEffect(() => {
    if (obj) {
      setTitle(obj.title);
      setContent((obj.properties?.content as string) || '');
    }
  }, [obj]);

  // Track navigation separately to avoid dependency issues
  useEffect(() => {
    if (obj?.id) {
      const history = useUIStore.getState().objectHistory;
      const currentIndex = useUIStore.getState().objectHistoryIndex;

      // Only add to history if it's not already the current item
      if (history[currentIndex] !== obj.id) {
        navigateToObject(obj.id);
      }
    }
  }, [obj?.id, navigateToObject]);

  const handleTitleSave = async () => {
    if (obj && title !== obj.title) {
      await updateObject.mutateAsync({
        id: obj.id,
        patch: { title },
      });
    }
    setIsEditingTitle(false);
  };

  // Auto-save minor version (debounced)
  const saveMinorVersion = useCallback(() => {
    if (!obj) return;

    createVersion({
      objectId: obj.id,
      content,
      properties: obj.properties || {},
      author: currentUser,
      isMajor: false,
      tagsSnapshot: obj.tags,
    });
  }, [obj, content, currentUser]);

  const handleContentUpdate = async (newContent: string) => {
    if (!obj) return;
    setContent(newContent);

    updateObject.mutate({
      id: obj.id,
      patch: {
        properties: { ...obj.properties, content: newContent },
      },
    });

    // Debounced auto-save for minor version (document types only)
    if (obj.type === 'doc' || obj.type === 'note') {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      autoSaveTimer.current = setTimeout(() => {
        saveMinorVersion();
      }, 5000); // Save minor version after 5 seconds of inactivity
    }
  };

  const handleCreateMajorVersion = (description: string) => {
    if (!obj) return;

    createVersion({
      objectId: obj.id,
      content,
      properties: obj.properties || {},
      author: currentUser,
      isMajor: true,
      changeDescription: description,
      tagsSnapshot: obj.tags,
    });

    setShowMajorVersionDialog(false);
    toast({
      title: 'Major version created',
      description: `Version ${(latestVersion?.majorVersion || 0) + 1}.0 has been saved.`,
    });
  };

  const handleRestoreVersion = (version: DocumentVersion) => {
    setContent(version.content);
    handleCreateMajorVersion(`Restored from version ${version.versionNumber}`);
  };

  const handleLock = () => {
    if (!obj) return;
    lockDocument({
      objectId: obj.id,
      userId: currentUser,
      reason: 'Editing document',
    });
    toast({
      title: 'Document locked',
      description: 'You now have exclusive editing rights.',
    });
  };

  const handleUnlock = () => {
    if (!obj) return;
    unlockDocument(obj.id, currentUser);
    toast({
      title: 'Document unlocked',
      description: 'Other users can now edit this document.',
    });
  };

  const handleTagsUpdate = async (newTags: TagRef[]) => {
    if (!obj) return;

    await updateObject.mutateAsync({
      id: obj.id,
      patch: { tags: newTags },
    });
  };

  const handleAddToWiki = () => {
    if (!obj) return;

    addToWiki(obj.id, null, wsId);
    toast({
      title: 'Added to Wiki',
      description: `"${obj.title}" has been added to your wiki.`,
    });
  };

  if (isLoading || !obj) {
    return (
      <div className="h-full border-l bg-card flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full border-l bg-card flex flex-col">
      {/* Header - Compressed */}
      <div className="border-b px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{obj.icon || '📄'}</span>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground capitalize">{obj.type}</span>
              {currentCollection && (
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams();
                    newParams.set('collectionId', currentCollection.id);
                    navigate(`/w/${wsId}/collections?${newParams.toString()}`);
                  }}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <span>{currentCollection.icon}</span>
                  <span>{currentCollection.name}</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* History navigation */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const prevId = navigateBack();
                if (prevId) setSelectedObjectId(prevId);
              }}
              disabled={!canGoBack()}
              className="h-7 w-7"
              title="Back"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const nextId = navigateForward();
                if (nextId) setSelectedObjectId(nextId);
              }}
              disabled={!canGoForward()}
              className="h-7 w-7"
              title="Forward"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRightPanel}
              className="h-7 w-7"
              title={rightPanelOpen ? 'Hide properties' : 'Show properties'}
            >
              <PanelRightClose className="h-3 w-3" />
            </Button>
            {/* Version Controls for Documents */}
            {(obj.type === 'doc' || obj.type === 'note') && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVersionHistory(true)}
                  className="h-7"
                  title="Version history"
                >
                  <GitBranch className="mr-1 h-3 w-3" />
                  {latestVersion ? `v${latestVersion.versionNumber}` : 'v1.0'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMajorVersionDialog(true)}
                  className="h-7"
                  disabled={!editPermission.canEdit}
                  title="Create major version"
                >
                  <Lock className="mr-1 h-3 w-3" />
                  Major
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const pinDocument = useUIStore.getState().pinDocument;
                const unpinDocument = useUIStore.getState().unpinDocument;
                const isPinned = useUIStore.getState().isPinned(obj.id);

                if (isPinned) {
                  unpinDocument(obj.id);
                  toast({ title: 'Unpinned' });
                } else {
                  pinDocument(obj.id);
                  toast({ title: 'Pinned' });
                }
              }}
              className="h-7"
            >
              <Plus className="mr-1 h-3 w-3" />
              Pin
            </Button>
            <Button variant="outline" size="sm" onClick={onOpenFull} className="h-7">
              <ExternalLink className="mr-1 h-3 w-3" />
              Full
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isInWiki && (obj.type === 'doc' || obj.type === 'note') && (
                  <>
                    <DropdownMenuItem onClick={handleAddToWiki}>
                      <BookMarked className="mr-2 h-4 w-4" />
                      Add to Wiki
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Title */}
        {isEditingTitle ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave();
              else if (e.key === 'Escape') {
                setTitle(obj.title);
                setIsEditingTitle(false);
              }
            }}
            autoFocus
            className="text-xl font-bold"
          />
        ) : (
          <div className="flex items-center gap-2 group">
            <h2 className="text-xl font-bold flex-1">{title}</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsEditingTitle(true)}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Security */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">SECURITY</span>
            {obj.securityTagId || currentCollection?.defaultSecurityTagId ? (
              <button onClick={() => setShowSecuritySelector(true)} className="hover:opacity-80">
                <SecurityTagIndicator
                  securityTagId={obj.securityTagId || currentCollection?.defaultSecurityTagId}
                  isInherited={!obj.securityTagId && !!currentCollection?.defaultSecurityTagId}
                  size="sm"
                />
              </button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSecuritySelector(true)}
                className="h-6"
              >
                <Shield className="h-3 w-3 mr-1" />
                Set
              </Button>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">TAGS</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 -mr-2"
              onClick={() => setShowTagSelector(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              <span className="text-xs">Add</span>
            </Button>
          </div>
          {obj.tags && obj.tags.length > 0 ? (
            <TagChips
              tags={obj.tags}
              onRemove={(tagKey) => {
                const newTags = obj.tags?.filter((t) => t.key !== tagKey) || [];
                handleTagsUpdate(newTags);
              }}
              onEntityClick={(entityId) => {
                navigateToObject(entityId);
                setSelectedObjectId(entityId);
              }}
            />
          ) : (
            <p className="text-xs text-muted-foreground">No tags</p>
          )}
        </div>

        {obj.referenceTags && obj.referenceTags.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">REFERENCED OBJECTS</span>
            <TagChips
              tags={obj.referenceTags}
              onEntityClick={(entityId) => {
                navigateToObject(entityId);
                setSelectedObjectId(entityId);
              }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {/* For documents - editor + related items */}
        {(obj.type === 'doc' || obj.type === 'note') && (
          <div className="p-4 pb-12 space-y-6">
            <div className="min-h-[500px] border rounded-lg">
              <RichTextEditor
                content={content}
                onUpdate={handleContentUpdate}
                placeholder="Start writing..."
              />
            </div>
            <div className="border-t pt-6">
              <RelatedObjectsSection objectId={obj.id} wsId={obj.wsId} tags={obj.tags} />
            </div>
          </div>
        )}

        {/* For emails */}
        {obj.type === 'email' && obj.emailMetadata && (
          <div className="flex-1 p-4">
            <EmailViewer
              metadata={obj.emailMetadata as any}
              content={(obj.properties?.body as string) || ''}
            />
          </div>
        )}

        {/* For websites */}
        {obj.type === 'website' && obj.websiteUrl && (
          <div className="flex-1">
            <WebsiteViewer url={obj.websiteUrl} title={obj.title} properties={obj.properties} />
          </div>
        )}

        {/* For non-document types - show description + properties + related */}
        {obj.type !== 'doc' &&
          obj.type !== 'note' &&
          obj.type !== 'email' &&
          obj.type !== 'website' && (
            <div className="p-4 space-y-6 pb-12">
              {/* Always show description editor for non-documents */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Description
                </h4>
                <div className="h-[200px] border rounded-lg">
                  <RichTextEditor
                    content={(obj.properties?.Description as string) || ''}
                    onUpdate={(newDesc) => {
                      updateObject.mutate({
                        id: obj.id,
                        patch: {
                          properties: { ...obj.properties, Description: newDesc },
                        },
                      });
                    }}
                    placeholder="Add description..."
                  />
                </div>
              </div>

              <PropertyDisplay object={obj} />
              <RelatedObjectsSection objectId={obj.id} wsId={obj.wsId} tags={obj.tags} />
            </div>
          )}
      </ScrollArea>

      {/* Tag Selector Popover */}
      {showTagSelector && (
        <TagSelector
          open={showTagSelector}
          onClose={() => setShowTagSelector(false)}
          currentTags={obj.tags || []}
          onUpdate={handleTagsUpdate}
        />
      )}

      {/* Security Tag Selector */}
      {showSecuritySelector && (
        <SecurityTagSelector
          open={showSecuritySelector}
          onClose={() => setShowSecuritySelector(false)}
          currentSecurityTagId={obj.securityTagId}
          onUpdate={(tagId) => {
            updateObject.mutate({
              id: obj.id,
              patch: { securityTagId: tagId || undefined },
            });
            toast({
              title: 'Security updated',
              description: tagId ? 'Security tag applied' : 'Using collection default',
            });
          }}
          showInheritedOption={true}
          inheritedLabel={
            currentCollection?.defaultSecurityTagId
              ? `Inherit from ${currentCollection.name} (${
                  tags.find((t) => t.id === currentCollection.defaultSecurityTagId)?.label ||
                  'Default'
                })`
              : 'No Security (Public)'
          }
        />
      )}

      {/* Version History Dialog */}
      {showVersionHistory && (
        <VersionHistory
          open={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          versions={versions}
          currentVersion={latestVersion?.versionNumber || '1.0'}
          onRestore={handleRestoreVersion}
          onViewVersion={(version) => {
            setContent(version.content);
            toast({
              title: 'Viewing version',
              description: `Now viewing version ${version.versionNumber}. Changes will not be saved.`,
            });
          }}
        />
      )}

      {/* Create Major Version Dialog */}
      {showMajorVersionDialog && (
        <CreateMajorVersionDialog
          open={showMajorVersionDialog}
          onClose={() => setShowMajorVersionDialog(false)}
          onConfirm={handleCreateMajorVersion}
          nextMajorVersion={`${(latestVersion?.majorVersion || 0) + 1}.0`}
        />
      )}
    </div>
  );
}
