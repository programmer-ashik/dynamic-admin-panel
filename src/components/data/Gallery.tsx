import { Card, CardContent } from '@/components/ui/card';
import { TagChips } from '@/components/common/TagChips';
import { formatRelativeDate } from '@/lib/utils';
import type { MNoteObject } from '@/lib/types';
import { useUIStore } from '@/lib/store';

interface GalleryProps {
  data: MNoteObject[];
}

export function Gallery({ data }: GalleryProps) {
  const setSelectedObjectId = useUIStore((state) => state.setSelectedObjectId);

  const handleCardClick = (obj: MNoteObject) => {
    setSelectedObjectId(obj.id);
    // Opens in side pane instead of navigating
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((item) => (
        <Card
          key={item.id}
          className="cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick(item)}
        >
          {item.coverUrl && (
            <div
              className="h-32 bg-cover bg-center"
              style={{ backgroundImage: `url(${item.coverUrl})` }}
            />
          )}
          {!item.coverUrl && (
            <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <span className="text-6xl opacity-50">{item.icon || '📄'}</span>
            </div>
          )}
          <CardContent className="p-4 space-y-3">
            <div>
              <div className="flex items-start gap-2">
                {!item.coverUrl && (
                  <span className="text-xl">{item.icon || '📄'}</span>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.title}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                </div>
              </div>
            </div>

            {item.tags && item.tags.length > 0 && <TagChips tags={item.tags} />}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatRelativeDate(item.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

