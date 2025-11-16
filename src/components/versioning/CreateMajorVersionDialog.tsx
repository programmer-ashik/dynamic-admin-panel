import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GitBranch } from 'lucide-react';

interface CreateMajorVersionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (description: string) => void;
  nextMajorVersion: string;
}

export function CreateMajorVersionDialog({
  open,
  onClose,
  onConfirm,
  nextMajorVersion,
}: CreateMajorVersionDialogProps) {
  const [description, setDescription] = useState('');

  const handleConfirm = () => {
    onConfirm(description);
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Create Major Version
          </DialogTitle>
          <DialogDescription>
            You're about to create version <strong>{nextMajorVersion}</strong>. This will lock the
            current state as an immutable milestone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Change Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what changed in this version..."
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Required for pharma compliance and audit trails
            </p>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
            <div className="font-medium">Major versions are:</div>
            <ul className="text-xs text-muted-foreground space-y-0.5 ml-4">
              <li>• Immutable (cannot be edited after creation)</li>
              <li>• Timestamped and attributed</li>
              <li>• Restorable (creates new major version)</li>
              <li>• Suitable for regulatory submissions</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!description.trim()}>
            Create Version {nextMajorVersion}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

