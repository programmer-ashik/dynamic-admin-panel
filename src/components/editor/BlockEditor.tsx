import { useState, useRef, useEffect } from 'react';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Block, BlockType, InlineFormat } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { SlashMenu } from './SlashMenu';
import { FormattingToolbar } from './FormattingToolbar';
import { RichTextInput } from './RichTextInput';

interface BlockEditorProps {
  blocks: Block[];
  onUpdate: (blocks: Block[]) => void;
  objectId: string;
}

export function BlockEditor({ blocks: initialBlocks, onUpdate, objectId }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    const newBlocks = blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
    setBlocks(newBlocks);
    onUpdate(newBlocks);
  };

  const addBlock = (afterBlockId?: string, type: BlockType = 'paragraph') => {
    const newBlock: Block = {
      id: generateId('block'),
      parentId: null,
      objectId,
      type,
      text: '',
      children: [],
    };

    let newBlocks: Block[];
    if (afterBlockId) {
      const index = blocks.findIndex((b) => b.id === afterBlockId);
      newBlocks = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
    } else {
      newBlocks = [...blocks, newBlock];
    }

    setBlocks(newBlocks);
    onUpdate(newBlocks);
    setFocusedBlockId(newBlock.id);
    return newBlock.id;
  };

  const deleteBlock = (blockId: string) => {
    const newBlocks = blocks.filter((b) => b.id !== blockId);
    setBlocks(newBlocks);
    onUpdate(newBlocks);
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex((b) => b.id === blockId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

    setBlocks(newBlocks);
    onUpdate(newBlocks);
  };

  const handleSlashCommand = (blockId: string, command: string) => {
    const typeMap: Record<string, BlockType> = {
      heading1: 'heading1',
      heading2: 'heading2',
      heading3: 'heading3',
      bulletList: 'bulletList',
      numberedList: 'numberedList',
      todo: 'todo',
      code: 'code',
      quote: 'quote',
      divider: 'divider',
      callout: 'callout',
    };

    const newType = typeMap[command];
    if (newType) {
      updateBlock(blockId, { type: newType });
    }
    setShowSlashMenu(false);
  };

  const handleFormat = (format: string, value?: string) => {
    // Formatting is handled by document.execCommand in the toolbar
    // Just track active state
    const newActiveFormats = new Set(activeFormats);
    if (newActiveFormats.has(format)) {
      newActiveFormats.delete(format);
    } else {
      newActiveFormats.add(format);
    }
    setActiveFormats(newActiveFormats);
  };

  if (blocks.length === 0) {
    addBlock();
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <FormattingToolbar onFormat={handleFormat} activeFormats={activeFormats} />

      <div className="space-y-1 p-8 bg-card min-h-[400px]">
        {blocks.map((block, index) => (
          <BlockItem
            key={block.id}
            block={block}
            isActive={activeBlockId === block.id}
            isFocused={focusedBlockId === block.id}
            onFocus={() => setFocusedBlockId(block.id)}
            onBlur={() => setFocusedBlockId(null)}
            onMouseEnter={() => setActiveBlockId(block.id)}
            onMouseLeave={() => setActiveBlockId(null)}
            onUpdate={(updates) => updateBlock(block.id, updates)}
            onDelete={() => deleteBlock(block.id)}
            onMoveUp={index > 0 ? () => moveBlock(block.id, 'up') : undefined}
            onMoveDown={index < blocks.length - 1 ? () => moveBlock(block.id, 'down') : undefined}
            onEnter={() => addBlock(block.id)}
            onSlashCommand={(cmd) => handleSlashCommand(block.id, cmd)}
            onShowSlashMenu={(show, pos) => {
              setShowSlashMenu(show);
              if (pos) setSlashMenuPosition(pos);
            }}
          />
        ))}

        {/* Add block button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => addBlock()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add a block
        </Button>

        {/* Slash menu */}
        {showSlashMenu && (
          <div
            className="absolute z-50"
            style={{ top: slashMenuPosition.top, left: slashMenuPosition.left }}
          >
            <SlashMenu onSelect={(cmd) => handleSlashCommand(focusedBlockId || '', cmd)} />
          </div>
        )}
      </div>
    </div>
  );
}

interface BlockItemProps {
  block: Block;
  isActive: boolean;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onEnter: () => void;
  onSlashCommand: (command: string) => void;
  onShowSlashMenu: (show: boolean, position?: { top: number; left: number }) => void;
}

function BlockItem({
  block,
  isActive,
  isFocused,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onEnter,
  onSlashCommand,
  onShowSlashMenu,
}: BlockItemProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    }

    // Detect slash command
    if (e.key === '/' && block.text === '') {
      e.preventDefault();
      const rect = inputRef.current?.getBoundingClientRect();
      if (rect) {
        onShowSlashMenu(true, { top: rect.bottom, left: rect.left });
      }
    }

    if (e.key === 'Escape') {
      onShowSlashMenu(false);
    }
  };

  const handleChange = (value: string) => {
    onUpdate({ text: value });

    // Hide slash menu if text changes
    if (value !== '/') {
      onShowSlashMenu(false);
    }
  };

  const renderBlock = () => {
    const baseClasses = 'w-full bg-transparent';

    switch (block.type) {
      case 'heading1':
        return (
          <RichTextInput
            value={block.text || ''}
            onChange={(text) => onUpdate({ text })}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="Heading 1"
            className={cn(baseClasses, 'text-4xl font-bold py-2')}
          />
        );

      case 'heading2':
        return (
          <RichTextInput
            value={block.text || ''}
            onChange={(text) => onUpdate({ text })}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="Heading 2"
            className={cn(baseClasses, 'text-2xl font-semibold py-1.5')}
          />
        );

      case 'heading3':
        return (
          <RichTextInput
            value={block.text || ''}
            onChange={(text) => onUpdate({ text })}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="Heading 3"
            className={cn(baseClasses, 'text-xl font-medium py-1')}
          />
        );

      case 'bulletList':
      case 'numberedList':
        return (
          <div className="flex items-start gap-3 py-0.5">
            <span className="mt-1.5 text-muted-foreground select-none w-5 shrink-0">
              {block.type === 'bulletList' ? '•' : '1.'}
            </span>
            <RichTextInput
              value={block.text || ''}
              onChange={(text) => onUpdate({ text })}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder="List item"
              className={cn(baseClasses, 'flex-1')}
              multiline
            />
          </div>
        );

      case 'todo':
        return (
          <div className="flex items-start gap-3 py-0.5">
            <input
              type="checkbox"
              checked={block.attrs?.checked === true}
              onChange={(e) => onUpdate({ attrs: { ...block.attrs, checked: e.target.checked } })}
              className="mt-1.5 h-4 w-4 rounded border-gray-300 cursor-pointer"
            />
            <RichTextInput
              value={block.text || ''}
              onChange={(text) => onUpdate({ text })}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder="To-do"
              className={cn(
                baseClasses,
                'flex-1',
                block.attrs?.checked && 'line-through opacity-50'
              )}
              multiline
            />
          </div>
        );

      case 'code':
        return (
          <div className="bg-muted/50 border border-border rounded-lg p-3 my-1">
            <RichTextInput
              value={block.text || ''}
              onChange={(text) => onUpdate({ text })}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder="Code"
              className={cn(baseClasses, 'font-mono text-sm')}
              multiline
            />
          </div>
        );

      case 'quote':
        return (
          <div className="border-l-4 border-primary pl-4 py-1 my-1">
            <RichTextInput
              value={block.text || ''}
              onChange={(text) => onUpdate({ text })}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder="Quote"
              className={cn(baseClasses, 'italic text-muted-foreground')}
              multiline
            />
          </div>
        );

      case 'callout':
        return (
          <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded-r-lg my-2">
            <RichTextInput
              value={block.text || ''}
              onChange={(text) => onUpdate({ text })}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder="Callout"
              className={cn(baseClasses, 'text-blue-900 dark:text-blue-100')}
              multiline
            />
          </div>
        );

      case 'divider':
        return <div className="border-t border-border my-4" />;

      default:
        return (
          <RichTextInput
            value={block.text || ''}
            onChange={(text) => onUpdate({ text })}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="Type '/' for commands..."
            className={cn(baseClasses, 'py-0.5')}
            multiline
          />
        );
    }
  };

  if (block.type === 'divider') {
    return (
      <div
        className={cn('group relative py-2', isActive && 'bg-accent/10')}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="border-t border-border" />
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative rounded-sm px-2 -mx-2 transition-colors',
        isActive && 'bg-accent/5'
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Block controls (left side) */}
      {isActive && (
        <div className="absolute left-0 top-1 -translate-x-full flex items-center gap-0.5 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-5 w-5 cursor-grab">
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => {
              addBlock(block.id);
            }}
          >
            <Plus className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      )}

      {/* Block content */}
      <div className="py-1">{renderBlock()}</div>

      {/* Block actions (right side) */}
      {isActive && (
        <div className="absolute right-0 top-1 translate-x-full flex items-center gap-0.5 pl-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onDelete}>
            <Trash2 className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      )}
    </div>
  );
}
