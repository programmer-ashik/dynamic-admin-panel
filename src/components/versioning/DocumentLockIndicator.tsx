import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Clock } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import type { DocumentLock } from '@/lib/versioning';

interface DocumentLockIndicatorProps {
  lock: DocumentLock | null;
  currentUser: string;
  onLock: () => void;
  onUnlock: () => void;
}

export function DocumentLockIndicator({
  lock,
  currentUser,
  onLock,
  onUnlock,
}: DocumentLockIndicatorProps) {
  const isLockedByMe = lock?.lockedBy === currentUser;
  const isLocked = !!lock;

  if (!isLocked) {
    return (
      <Button variant="outline" size="sm" onClick={onLock} className="gap-2">
        <Lock className="h-3 w-3" />
        Lock for Editing
      </Button>
    );
  }

  if (isLockedByMe) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="default" className="gap-1">
          <Lock className="h-3 w-3" />
          Locked by you
        </Badge>
        <Button variant="ghost" size="sm" onClick={onUnlock}>
          <Unlock className="h-3 w-3" />
          Unlock
        </Button>
      </div>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1">
      <Lock className="h-3 w-3" />
      Locked by {lock.lockedBy}
      {lock.expiresAt && (
        <span className="text-xs ml-1">
          • Expires {formatRelativeDate(lock.expiresAt)}
        </span>
      )}
    </Badge>
  );
}

