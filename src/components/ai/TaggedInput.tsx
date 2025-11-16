import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Tag } from '@/lib/types';

interface TaggedInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  selectedTags: Tag[];
  onRemoveTag: (tagId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export function TaggedInput({
  value,
  onChange,
  onKeyDown,
  selectedTags,
  onRemoveTag,
  placeholder,
  disabled,
  inputRef,
}: TaggedInputProps) {
  return (
    <div
      className={cn(
        'flex h-10 w-full items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      {/* Tag badges */}
      {selectedTags.map((tag) => (
        <Badge
          key={tag.id}
          variant={tag.kind === 'entity' ? 'default' : 'secondary'}
          className="gap-1 pr-1 shrink-0"
        >
          <span>{tag.label}</span>
          <button
            onClick={() => onRemoveTag(tag.id)}
            className="ml-0.5 rounded-full hover:bg-background/50 p-0.5"
            type="button"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}

      {/* Text input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={selectedTags.length === 0 ? placeholder : ''}
        disabled={disabled}
        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed min-w-[100px]"
      />
    </div>
  );
}
