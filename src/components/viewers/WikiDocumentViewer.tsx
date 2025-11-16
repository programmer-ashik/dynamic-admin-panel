import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock, User } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import type { MNoteObject } from '@/lib/types';

interface WikiDocumentViewerProps {
  object: MNoteObject;
}

export function WikiDocumentViewer({ object }: WikiDocumentViewerProps) {
  const content = (object.properties?.content as string) || '';

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header - Read-only mode indicator */}
      <div className="border-b bg-muted/30 px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{object.icon || '📄'}</span>
                <h1 className="text-3xl font-bold">{object.title}</h1>
              </div>
              <Badge variant="outline" className="mt-2">
                Read-only Wiki View
              </Badge>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>Last updated {formatRelativeDate(object.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Created {formatRelativeDate(object.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Clean reading mode */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {object.coverUrl && (
            <div
              className="w-full h-80 bg-cover bg-center rounded-lg mb-8"
              style={{ backgroundImage: `url(${object.coverUrl})` }}
            />
          )}

          <article
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Properties (if any) */}
          {object.properties &&
            Object.keys(object.properties).filter((k) => k !== 'content' && k !== 'body').length >
              0 && (
              <Card className="mt-12 bg-muted/30">
                <div className="p-6 space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                    Document Properties
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(object.properties)
                      .filter(([key]) => key !== 'content' && key !== 'body')
                      .map(([key, value]) => (
                        <div key={key}>
                          <div className="text-xs text-muted-foreground font-medium uppercase mb-1">
                            {key}
                          </div>
                          <div className="text-sm">{String(value)}</div>
                        </div>
                      ))}
                  </div>
                </div>
              </Card>
            )}
        </div>
      </ScrollArea>
    </div>
  );
}
