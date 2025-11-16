import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import type { CollectionProperty, PropertyType, Collection } from '@/lib/types';
import { generateId } from '@/lib/utils';

interface PropertyEditorProps {
  properties: CollectionProperty[];
  onChange: (properties: CollectionProperty[]) => void;
  availableCollections?: Collection[];
}

export function PropertyEditor({
  properties,
  onChange,
  availableCollections = [],
}: PropertyEditorProps) {
  const [editingProperty, setEditingProperty] = useState<string | null>(null);

  const addProperty = () => {
    const newProperty: CollectionProperty = {
      id: generateId('prop'),
      name: 'New Property',
      type: 'text',
      required: false,
    };
    onChange([...properties, newProperty]);
    setEditingProperty(newProperty.id);
  };

  const updateProperty = (id: string, updates: Partial<CollectionProperty>) => {
    onChange(properties.map((prop) => (prop.id === id ? { ...prop, ...updates } : prop)));
  };

  const deleteProperty = (id: string) => {
    onChange(properties.filter((prop) => prop.id !== id));
  };

  const moveProperty = (index: number, direction: 'up' | 'down') => {
    const newProperties = [...properties];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProperties.length) return;

    [newProperties[index], newProperties[targetIndex]] = [
      newProperties[targetIndex],
      newProperties[index],
    ];
    onChange(newProperties);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Properties</Label>
        <Button type="button" variant="outline" size="sm" onClick={addProperty}>
          <Plus className="mr-2 h-3 w-3" />
          Add Property
        </Button>
      </div>

      {properties.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No properties yet. Click "Add Property" to create one.
        </p>
      ) : (
        <div className="space-y-2">
          {properties.map((property, index) => (
            <PropertyItem
              key={property.id}
              property={property}
              isEditing={editingProperty === property.id}
              onEdit={() => setEditingProperty(property.id)}
              onUpdate={(updates) => updateProperty(property.id, updates)}
              onDelete={() => deleteProperty(property.id)}
              onMoveUp={index > 0 ? () => moveProperty(index, 'up') : undefined}
              onMoveDown={
                index < properties.length - 1 ? () => moveProperty(index, 'down') : undefined
              }
              availableCollections={availableCollections}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PropertyItemProps {
  property: CollectionProperty;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updates: Partial<CollectionProperty>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  availableCollections: Collection[];
}

function PropertyItem({
  property,
  isEditing,
  onEdit,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  availableCollections,
}: PropertyItemProps) {
  const [optionsText, setOptionsText] = useState(property.options?.join(', ') || '');

  const handleOptionsChange = (text: string) => {
    setOptionsText(text);
    const options = text
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    onUpdate({ options: options.length > 0 ? options : undefined });
  };

  if (!isEditing) {
    return (
      <div
        className="flex items-center gap-2 p-3 border rounded-md hover:bg-accent/50 cursor-pointer group"
        onClick={onEdit}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{property.name}</span>
            {property.required && <span className="text-xs text-destructive">*</span>}
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {property.type.replace('_', ' ')}
            {property.type === 'select' && property.options && (
              <span> • {property.options.join(', ')}</span>
            )}
            {property.type === 'collection_ref' && property.referencedCollectionId && (
              <span>
                {' '}
                •{' '}
                {availableCollections.find((c) => c.id === property.referencedCollectionId)?.name ||
                  'Unknown Collection'}
              </span>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 border rounded-md space-y-3 bg-accent/20">
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          {onMoveUp && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4"
              onClick={onMoveUp}
            >
              ▲
            </Button>
          )}
          {onMoveDown && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4"
              onClick={onMoveDown}
            >
              ▼
            </Button>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Input
            value={property.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Property name"
            className="font-medium"
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Type</Label>
              <Select
                value={property.type}
                onValueChange={(value: PropertyType) => onUpdate({ type: value })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="select">Select (Single)</SelectItem>
                  <SelectItem value="multiselect">Multi-Select</SelectItem>
                  <SelectItem value="collection_ref">Collection Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={property.required}
                  onCheckedChange={(checked) => onUpdate({ required: checked === true })}
                />
                <span className="text-xs">Required</span>
              </label>
            </div>
          </div>

          {(property.type === 'select' || property.type === 'multiselect') && (
            <div>
              <Label className="text-xs">Options (comma-separated)</Label>
              <Input
                value={optionsText}
                onChange={(e) => handleOptionsChange(e.target.value)}
                placeholder="Option 1, Option 2, Option 3"
                className="h-8 text-xs"
              />
            </div>
          )}

          {property.type === 'collection_ref' && (
            <>
              <div>
                <Label className="text-xs">Referenced Collection</Label>
                <Select
                  value={property.referencedCollectionId || ''}
                  onValueChange={(value) => onUpdate({ referencedCollectionId: value })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select collection..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCollections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.icon} {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={property.isMultiSelect || false}
                    onCheckedChange={(checked) => onUpdate({ isMultiSelect: checked === true })}
                  />
                  <span className="text-xs">Allow multiple selections</span>
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onEdit} className="flex-1">
          Done
        </Button>
        <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
