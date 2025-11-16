import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useObjects, useCollections } from '@/lib/query';
import type { MNoteObject } from '@/lib/types';

interface PropertyDisplayProps {
  object: MNoteObject;
}

export function PropertyDisplay({ object }: PropertyDisplayProps) {
  const { data: objectsData } = useObjects();
  const { data: collectionsData } = useCollections();
  const allObjects = objectsData?.items || [];
  const collections = collectionsData?.items || [];
  
  const properties = object.properties || {};
  const propertyEntries = Object.entries(properties).filter(
    ([key]) => key !== 'content' && key !== 'body' && key !== 'Description'
  );

  if (propertyEntries.length === 0) {
    return null;
  }

  // Find the collection to get property metadata
  const collection = collections.find(c => c.id === object.collectionId);
  
  // Helper to get object label from ID
  const getObjectLabel = (id: string) => {
    const obj = allObjects.find(o => o.id === id);
    return obj ? obj.title : id;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase">Properties</h3>
      <div className="grid grid-cols-2 gap-4">
        {propertyEntries.map(([key, value]) => {
          // Check if this is a collection_ref property
          const propertyDef = collection?.properties?.find(p => p.name === key);
          const isCollectionRef = propertyDef?.type === 'collection_ref';
          
          return (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground font-medium uppercase">
                  {key}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(value) ? (
                  <div className="flex flex-wrap gap-1">
                    {value.map((v, i) => (
                      <Badge key={i} variant="secondary">
                        {isCollectionRef ? getObjectLabel(String(v)) : String(v)}
                      </Badge>
                    ))}
                  </div>
                ) : typeof value === 'boolean' ? (
                  <span className="text-lg">{value ? '✓' : '✗'}</span>
                ) : key.toLowerCase().includes('date') ? (
                  <span className="text-sm">{formatDate(String(value))}</span>
                ) : isCollectionRef ? (
                  <span className="text-sm font-medium">{getObjectLabel(String(value))}</span>
                ) : (
                  <span className="text-sm font-medium">{String(value)}</span>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
