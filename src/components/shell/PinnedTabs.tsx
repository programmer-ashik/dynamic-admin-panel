import { X, Pin } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useObject } from '@/lib/query';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function PinnedTabs() {
  const navigate = useNavigate();
  const { wsId = 'ws_default', id: currentObjectId } = useParams();
  const pinnedDocuments = useUIStore((state) => state.pinnedDocuments);
  const unpinDocument = useUIStore((state) => state.unpinDocument);
  const setSelectedObjectId = useUIStore((state) => state.setSelectedObjectId);

  if (pinnedDocuments.length === 0) {
    return null;
  }

  return (
    <div className="border-b bg-muted/30">
      <ScrollArea className="w-full">
        <div className="flex items-center gap-1 px-4 py-1">
          {pinnedDocuments.map((docId) => (
            <PinnedTab
              key={docId}
              docId={docId}
              isActive={docId === currentObjectId}
              onClose={() => unpinDocument(docId)}
              onClick={() => {
                setSelectedObjectId(docId);
                navigate(`/w/${wsId}/object/${docId}`);
              }}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface PinnedTabProps {
  docId: string;
  isActive: boolean;
  onClose: () => void;
  onClick: () => void;
}

function PinnedTab({ docId, isActive, onClose, onClick }: PinnedTabProps) {
  const { data } = useObject(docId);
  const obj = data?.item;

  if (!obj) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex items-center gap-2 px-3 py-1.5 rounded-t-md border-t border-x transition-colors',
        isActive ? 'bg-background border-border' : 'bg-muted/50 border-transparent hover:bg-muted'
      )}
    >
      <span className="text-sm">{obj.icon || '📄'}</span>
      <span className="text-sm font-medium truncate max-w-[150px]">{obj.title}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X className="h-3 w-3" />
      </Button>
    </button>
  );
}
