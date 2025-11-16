import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Folder, FileText, Hash, X } from 'lucide-react';
import { useCollections, useObjects, useTags } from '@/lib/query';
import type { AIConversation } from '@/lib/store';

interface ContextSelectorProps {
  open: boolean;
  onClose: () => void;
  currentContext?: AIConversation['context'];
  onUpdate: (context: AIConversation['context']) => void;
}

export function ContextSelector({ open, onClose, currentContext, onUpdate }: ContextSelectorProps) {
  const { data: collectionsData } = useCollections();
  const { data: objectsData } = useObjects();
  const { data: tagsData } = useTags();

  const collections = collectionsData?.items || [];
  const objects = objectsData?.items || [];
  const tags = tagsData?.items || [];

  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    currentContext?.collectionIds || []
  );
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>(
    currentContext?.objectIds || []
  );
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>(
    currentContext?.tagSlugs || []
  );

  const toggleCollection = (id: string) => {
    setSelectedCollectionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleObject = (id: string) => {
    setSelectedObjectIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleTag = (slug: string) => {
    setSelectedTagSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSave = () => {
    onUpdate({
      collectionIds: selectedCollectionIds.length > 0 ? selectedCollectionIds : undefined,
      objectIds: selectedObjectIds.length > 0 ? selectedObjectIds : undefined,
      tagSlugs: selectedTagSlugs.length > 0 ? selectedTagSlugs : undefined,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedCollectionIds([]);
    setSelectedObjectIds([]);
    setSelectedTagSlugs([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>AI Context</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select collections, objects, and tags to focus the AI's attention
          </p>
        </DialogHeader>

        {/* Current Selections */}
        {(selectedCollectionIds.length > 0 || selectedObjectIds.length > 0 || selectedTagSlugs.length > 0) && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Selected Context</div>
            <div className="flex flex-wrap gap-1">
              {selectedCollectionIds.map((id) => {
                const coll = collections.find((c) => c.id === id);
                return coll ? (
                  <Badge key={id} variant="secondary" className="gap-1">
                    <span>{coll.icon}</span>
                    <span>{coll.name}</span>
                    <button onClick={() => toggleCollection(id)} className="ml-1">
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                ) : null;
              })}
              {selectedObjectIds.map((id) => {
                const obj = objects.find((o) => o.id === id);
                return obj ? (
                  <Badge key={id} variant="default" className="gap-1">
                    <span>{obj.icon}</span>
                    <span>{obj.title}</span>
                    <button onClick={() => toggleObject(id)} className="ml-1">
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                ) : null;
              })}
              {selectedTagSlugs.map((slug) => {
                const tag = tags.find((t) => t.slug === slug);
                return tag ? (
                  <Badge key={slug} variant="outline" className="gap-1">
                    <span>{tag.label}</span>
                    <button onClick={() => toggleTag(slug)} className="ml-1">
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {/* Collections */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Collections
              </h3>
              <div className="space-y-2">
                {collections.map((coll) => (
                  <div key={coll.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedCollectionIds.includes(coll.id)}
                      onCheckedChange={() => toggleCollection(coll.id)}
                    />
                    <label className="text-sm flex items-center gap-2 cursor-pointer flex-1">
                      <span>{coll.icon}</span>
                      <span>{coll.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Recent Objects */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Recent Objects
              </h3>
              <div className="space-y-2">
                {objects.slice(0, 10).map((obj) => (
                  <div key={obj.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedObjectIds.includes(obj.id)}
                      onCheckedChange={() => toggleObject(obj.id)}
                    />
                    <label className="text-sm flex items-center gap-2 cursor-pointer flex-1">
                      <span>{obj.icon}</span>
                      <span className="truncate">{obj.title}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tags */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Tags
              </h3>
              <div className="space-y-2">
                {tags.filter((t) => t.kind === 'simple').slice(0, 15).map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedTagSlugs.includes(tag.slug)}
                      onCheckedChange={() => toggleTag(tag.slug)}
                    />
                    <label className="text-sm cursor-pointer flex-1">
                      {tag.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>
            Clear All
          </Button>
          <Button onClick={handleSave}>Apply Context</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

