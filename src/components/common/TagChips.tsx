import { X } from 'lucide-react';
import type { TagRef } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TagChipsProps {
  tags: TagRef[];
  onRemove?: (tagKey: string) => void;
  onClick?: (tagKey: string) => void;
  onEntityClick?: (entityId: string) => void;
  className?: string;
}

export function TagChips({ tags, onRemove, onClick, onEntityClick, className }: TagChipsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {tags.map((tag) => (
        <div
          key={tag.key}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
            tag.kind === 'entity'
              ? 'bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            onClick && 'cursor-pointer'
          )}
          onClick={() => {
            if (tag.kind === 'entity' && tag.entityId && onEntityClick) {
              onEntityClick(tag.entityId);
            } else if (onClick) {
              onClick(tag.key);
            }
          }}
        >
          <span>{tag.label}</span>
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(tag.key);
              }}
              className="ml-0.5 rounded-full hover:bg-background/50"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag.label}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
