import { Card, CardContent } from '@/components/ui/card';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  CheckSquare,
  AlertCircle,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlashMenuProps {
  onSelect: (command: string) => void;
}

export function SlashMenu({ onSelect }: SlashMenuProps) {
  const commands = [
    { icon: Heading1, label: 'Heading 1', command: 'heading1', description: 'Big section heading' },
    { icon: Heading2, label: 'Heading 2', command: 'heading2', description: 'Medium section heading' },
    { icon: Heading3, label: 'Heading 3', command: 'heading3', description: 'Small section heading' },
    { icon: List, label: 'Bulleted List', command: 'bulletList', description: 'Simple bullet points' },
    { icon: ListOrdered, label: 'Numbered List', command: 'numberedList', description: 'Ordered list' },
    { icon: CheckSquare, label: 'To-do List', command: 'todo', description: 'Track tasks' },
    { icon: Code, label: 'Code', command: 'code', description: 'Code block with syntax' },
    { icon: Quote, label: 'Quote', command: 'quote', description: 'Quotation' },
    { icon: AlertCircle, label: 'Callout', command: 'callout', description: 'Highlighted box' },
    { icon: Minus, label: 'Divider', command: 'divider', description: 'Visual separator' },
  ];

  return (
    <Card className="w-80 shadow-xl border-2">
      <CardContent className="p-2">
        <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
          BASIC BLOCKS
        </div>
        <div className="space-y-0.5">
          {commands.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.command}
                onClick={() => onSelect(cmd.command)}
                className="w-full flex items-start gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors text-left"
              >
                <Icon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{cmd.label}</div>
                  <div className="text-xs text-muted-foreground">{cmd.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

