import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Block } from '@/lib/types';

interface EditorProps {
  blocks: Block[];
  onUpdate?: (content: string) => void;
  className?: string;
}

export function Editor({ blocks, onUpdate, className }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: blocksToHTML(blocks),
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
          className
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate?.(html);
    },
  });

  useEffect(() => {
    if (editor && blocks) {
      editor.commands.setContent(blocksToHTML(blocks));
    }
  }, [blocks, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg bg-card">
      <EditorContent editor={editor} />
    </div>
  );
}

/**
 * Convert blocks to HTML for TipTap
 */
function blocksToHTML(blocks: Block[]): string {
  if (!blocks || blocks.length === 0) {
    return '<p></p>';
  }

  return blocks
    .map((block) => {
      const text = block.text || '';

      switch (block.type) {
        case 'heading':
          const level = (block.attrs?.level as number) || 1;
          return `<h${level}>${text}</h${level}>`;
        case 'paragraph':
          return `<p>${text}</p>`;
        case 'list':
          const listType = block.attrs?.type === 'bullet' ? 'ul' : 'ol';
          return `<${listType}><li>${text}</li></${listType}>`;
        case 'code':
          return `<pre><code>${text}</code></pre>`;
        case 'todo':
          return `<p>[ ] ${text}</p>`;
        default:
          return `<p>${text}</p>`;
      }
    })
    .join('\n');
}

