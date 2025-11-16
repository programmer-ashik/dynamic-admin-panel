import { ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WebsiteViewerProps {
  url: string;
  title: string;
  properties?: Record<string, any>;
}

export function WebsiteViewer({ url, title, properties }: WebsiteViewerProps) {
  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Website Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">{title}</h3>
                {properties?.Rating && <span className="text-lg">{properties.Rating}</span>}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {properties?.Category && Array.isArray(properties.Category) && (
                <div className="flex flex-wrap gap-1">
                  {properties.Category.map((cat: string) => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Website iframe */}
      <div className="flex-1 border rounded-lg overflow-hidden bg-white">
        <iframe
          src={url}
          className="w-full h-full border-0"
          title={title}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>

      {/* Footer */}
      <div className="text-xs text-muted-foreground text-center">
        <p>
          External website loaded in iframe •{' '}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Open in new tab
          </a>
        </p>
      </div>
    </div>
  );
}
