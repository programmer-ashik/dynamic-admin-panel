import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { InlineFormat } from '@/lib/types';

interface RichTextInputProps {
  value: string;
  formats?: InlineFormat[];
  onChange: (value: string, formats?: InlineFormat[]) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}

export function RichTextInput({
  value,
  formats = [],
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  placeholder,
  className,
  multiline = false,
}: RichTextInputProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (contentRef.current && isInitialMount.current) {
      contentRef.current.innerText = value || '';
      isInitialMount.current = false;
    }
  }, []);

  const handleInput = () => {
    if (contentRef.current) {
      const text = contentRef.current.innerText || '';
      onChange(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      onKeyDown?.(e);
      return;
    }
    onKeyDown?.(e);
  };

  return (
    <div
      ref={contentRef}
      contentEditable
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      className={cn(
        'w-full bg-transparent outline-none focus:outline-none cursor-text',
        multiline ? 'min-h-[1.5rem]' : 'whitespace-nowrap overflow-hidden',
        className
      )}
      data-placeholder={placeholder}
      suppressContentEditableWarning
    />
  );
}
