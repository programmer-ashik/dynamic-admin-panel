import { Mail, Paperclip, Star, StarOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import type { EmailMetadata } from '@/lib/types';

interface EmailViewerProps {
  metadata: EmailMetadata;
  content: string;
  onToggleStar?: () => void;
}

export function EmailViewer({ metadata, content, onToggleStar }: EmailViewerProps) {
  return (
    <div className="space-y-4">
      {/* Email Header */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">{metadata.subject}</h2>
                {metadata.hasAttachments && <Paperclip className="h-4 w-4 text-muted-foreground" />}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-16">From:</span>
                  <span className="font-medium">{metadata.from}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground w-16 shrink-0">To:</span>
                  <div className="flex flex-wrap gap-1">
                    {metadata.to.map((email) => (
                      <Badge key={email} variant="secondary">
                        {email}
                      </Badge>
                    ))}
                  </div>
                </div>
                {metadata.cc && metadata.cc.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground w-16 shrink-0">Cc:</span>
                    <div className="flex flex-wrap gap-1">
                      {metadata.cc.map((email) => (
                        <Badge key={email} variant="outline">
                          {email}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-16">Date:</span>
                  <span>{formatDate(metadata.date, 'PPpp')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!metadata.isRead && (
                <Badge variant="default" className="h-6">
                  Unread
                </Badge>
              )}
              {onToggleStar && (
                <Button variant="ghost" size="icon" onClick={onToggleStar} className="h-8 w-8">
                  {metadata.isStarred ? (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Email Body */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
