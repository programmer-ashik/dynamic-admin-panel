import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Edit } from 'lucide-react';
import { useUpdateObject, useObjects, useCollections } from '@/lib/query';

interface EditablePropertyProps {
  propertyKey: string;
  value: any;
  objectId: string;
  allProperties: Record<string, any>;
}

export function EditableProperty({
  propertyKey,
  value,
  objectId,
  allProperties,
}: EditablePropertyProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value || ''));
  const updateObject = useUpdateObject();
  const { data: objectsData } = useObjects();
  const { data: collectionsData } = useCollections();

  const allObjectsList = objectsData?.items || [];
  const collections = collectionsData?.items || [];

  // Helper to get object label from ID
  const getObjectLabel = (id: string) => {
    const obj = allObjectsList.find((o) => o.id === id);
    return obj ? obj.title : id;
  };

  // Find if this property is a collection_ref
  const objectData = allObjectsList.find((o) => o.id === objectId);
  const collection = collections.find((c) => c.id === objectData?.collectionId);
  const propertyDef = collection?.properties?.find((p) => p.name === propertyKey);
  const isCollectionRef = propertyDef?.type === 'collection_ref';

  const handleSave = async () => {
    await updateObject.mutateAsync({
      id: objectId,
      patch: {
        properties: {
          ...allProperties,
          [propertyKey]: editValue,
        },
      },
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value || ''));
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          className="h-7 text-sm"
          autoFocus
        />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave}>
          <Check className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancel}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between">
      {Array.isArray(value) ? (
        <div className="flex flex-wrap gap-1">
          {value.map((v, i) => (
            <Badge key={i} variant="secondary">
              {isCollectionRef ? getObjectLabel(String(v)) : String(v)}
            </Badge>
          ))}
        </div>
      ) : typeof value === 'boolean' ? (
        <span className="text-sm">{value ? '✓' : '✗'}</span>
      ) : (
        <span className="text-sm">
          {isCollectionRef ? getObjectLabel(String(value)) : String(value)}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={() => setIsEditing(true)}
      >
        <Edit className="h-3 w-3" />
      </Button>
    </div>
  );
}
