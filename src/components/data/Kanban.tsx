import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TagChips } from '@/components/common/TagChips';
import { useUIStore } from '@/lib/store';
import type { MNoteObject } from '@/lib/types';
import { cn } from '@/lib/utils';

interface KanbanProps {
  data: MNoteObject[];
  groupBy?: string;
}

export function Kanban({ data, groupBy = 'status' }: KanbanProps) {
  const groups = useMemo(() => {
    const groupMap = new Map<string, MNoteObject[]>();

    for (const item of data) {
      const key = (item.properties[groupBy] as string) || 'No Status';
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(item);
    }

    // Default columns for task status
    const defaultStatuses = ['To Do', 'In Progress', 'Done'];
    for (const status of defaultStatuses) {
      if (!groupMap.has(status)) {
        groupMap.set(status, []);
      }
    }

    return Array.from(groupMap.entries()).sort((a, b) => {
      const order = defaultStatuses.indexOf(a[0]) - defaultStatuses.indexOf(b[0]);
      return order !== 0 ? order : a[0].localeCompare(b[0]);
    });
  }, [data, groupBy]);

  return (
    <div className="flex gap-4 h-full overflow-x-auto">
      {groups.map(([status, items]) => (
        <div key={status} className="flex-shrink-0 w-80">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                {status}
                <span className="ml-2 text-muted-foreground">({items.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-2">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {items.map((item) => (
                    <KanbanCard key={item.id} item={item} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

function KanbanCard({ item }: { item: MNoteObject }) {
  const setSelectedObjectId = useUIStore((state) => state.setSelectedObjectId);

  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => setSelectedObjectId(item.id)}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-lg">{item.icon || '📄'}</span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{item.title}</div>
            <div className="text-xs text-muted-foreground capitalize mt-0.5">{item.type}</div>
          </div>
        </div>
        {item.tags && item.tags.length > 0 && (
          <TagChips tags={item.tags} />
        )}
        {item.properties && Object.keys(item.properties).length > 0 && (
          <div className="text-xs text-muted-foreground space-y-1">
            {Object.entries(item.properties).slice(0, 2).map(([key, value]) => (
              <div key={key}>
                <span className="capitalize">{key}:</span> {String(value)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

