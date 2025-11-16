import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import type { DocumentVersion } from '@/lib/versioning';

interface VersionComparisonProps {
  open: boolean;
  onClose: () => void;
  versionA: DocumentVersion;
  versionB: DocumentVersion;
}

export function VersionComparison({ open, onClose, versionA, versionB }: VersionComparisonProps) {
  // Simple text diff (in production, use a proper diff library)
  const getChangeSummary = () => {
    const changes = [];
    
    // Compare properties
    const propsA = Object.keys(versionA.properties);
    const propsB = Object.keys(versionB.properties);
    
    for (const key of propsB) {
      if (versionA.properties[key] !== versionB.properties[key]) {
        changes.push({
          type: 'property',
          field: key,
          oldValue: versionA.properties[key],
          newValue: versionB.properties[key],
        });
      }
    }
    
    // Content change
    if (versionA.content !== versionB.content) {
      changes.push({
        type: 'content',
        field: 'Content',
        oldValue: versionA.content.length,
        newValue: versionB.content.length,
      });
    }
    
    return changes;
  };

  const changes = getChangeSummary();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Version Comparison</span>
            <div className="flex items-center gap-2 text-sm font-normal">
              <Badge variant="outline">v{versionA.versionNumber}</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="default">v{versionB.versionNumber}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Change Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-semibold mb-3">Changes Summary</div>
              {changes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No changes detected</p>
              ) : (
                <div className="space-y-2">
                  {changes.map((change, i) => (
                    <div key={i} className="text-sm flex items-center gap-2">
                      <Badge variant="secondary">{change.field}</Badge>
                      {change.type === 'property' && (
                        <>
                          <span className="line-through text-muted-foreground">
                            {String(change.oldValue)}
                          </span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="font-medium">{String(change.newValue)}</span>
                        </>
                      )}
                      {change.type === 'content' && (
                        <span className="text-muted-foreground">
                          {change.oldValue} → {change.newValue} characters
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Side-by-side content */}
          <div className="grid grid-cols-2 gap-4 h-[500px]">
            {/* Version A */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Version {versionA.versionNumber}</h3>
                <Badge variant="outline">{versionA.author}</Badge>
              </div>
              <ScrollArea className="h-full border rounded-lg">
                <div className="p-4">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: versionA.content }}
                  />
                </div>
              </ScrollArea>
            </div>

            {/* Version B */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Version {versionB.versionNumber}</h3>
                <Badge variant="default">{versionB.author}</Badge>
              </div>
              <ScrollArea className="h-full border rounded-lg bg-primary/5">
                <div className="p-4">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: versionB.content }}
                  />
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

