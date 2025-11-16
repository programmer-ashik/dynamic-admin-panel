import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Check } from 'lucide-react';
import { useTags } from '@/lib/query';
import { cn } from '@/lib/utils';

interface SecurityTagSelectorProps {
  open: boolean;
  onClose: () => void;
  currentSecurityTagId?: string;
  onUpdate: (tagId: string | null) => void;
  showInheritedOption?: boolean;
  inheritedLabel?: string;
}

export function SecurityTagSelector({
  open,
  onClose,
  currentSecurityTagId,
  onUpdate,
  showInheritedOption,
  inheritedLabel,
}: SecurityTagSelectorProps) {
  const { data: tagsData } = useTags();
  const tags = tagsData?.items || [];
  const securityTags = tags.filter((t) => t.kind === 'security');

  const handleSelect = (tagId: string | null) => {
    onUpdate(tagId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Select Security Tag
          </DialogTitle>
          <DialogDescription>
            Choose security level for access control. Security tags define who can view and edit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* None/Inherited Option */}
          {showInheritedOption && (
            <Card
              className={cn(
                'cursor-pointer transition-colors',
                !currentSecurityTagId ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'
              )}
              onClick={() => handleSelect(null)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {inheritedLabel || 'No Security Tag (Inherit from collection)'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Use collection default or no restrictions
                  </div>
                </div>
                {!currentSecurityTagId && <Check className="h-5 w-5 text-primary" />}
              </CardContent>
            </Card>
          )}

          {/* Security Tag Options */}
          {securityTags.map((tag) => {
            const isSelected = currentSecurityTagId === tag.id;

            return (
              <Card
                key={tag.id}
                className={cn(
                  'cursor-pointer transition-colors',
                  isSelected ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'
                )}
                onClick={() => handleSelect(tag.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <div className="font-medium">{tag.label}</div>
                        {isSelected && <Check className="h-5 w-5 text-primary" />}
                      </div>

                      {tag.accessRules && (tag.accessRules as any[]).length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground mb-1">Access Rules:</div>
                          {(tag.accessRules as any[]).slice(0, 3).map((rule: any, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs">
                              <Badge variant="outline" className="text-xs">
                                {rule.type}: {rule.targetId}
                              </Badge>
                              <span className="text-muted-foreground">→ {rule.permission}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {securityTags.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No security tags available. Create them in the Tag Manager.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
