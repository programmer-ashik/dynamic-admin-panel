import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CollectionProperty, Collection, PropertyValue } from '@/lib/types';

interface PropertyFormProps {
  properties: CollectionProperty[];
  values: Record<string, PropertyValue>;
  onChange: (key: string, value: PropertyValue) => void;
  availableCollections?: Collection[];
}

export function PropertyForm({
  properties,
  values,
  onChange,
  availableCollections = [],
}: PropertyFormProps) {
  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <PropertyField
          key={property.id}
          property={property}
          value={values[property.name]}
          onChange={(value) => onChange(property.name, value)}
          availableCollections={availableCollections}
        />
      ))}
    </div>
  );
}

interface PropertyFieldProps {
  property: CollectionProperty;
  value: PropertyValue;
  onChange: (value: PropertyValue) => void;
  availableCollections: Collection[];
}

function PropertyField({ property, value, onChange, availableCollections }: PropertyFieldProps) {
  const renderField = () => {
    switch (property.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${property.name.toLowerCase()}...`}
            required={property.required}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={(value as number) || ''}
            onChange={(e) => onChange(e.target.valueAsNumber)}
            placeholder={`Enter ${property.name.toLowerCase()}...`}
            required={property.required}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={(value as boolean) || false}
              onCheckedChange={(checked) => onChange(checked === true)}
            />
            <span className="text-sm text-muted-foreground">
              {(value as boolean) ? 'Yes' : 'No'}
            </span>
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            required={property.required}
          />
        );

      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={(val) => onChange(val)}
            required={property.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${property.name.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {property.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedOptions = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {property.options?.map((option) => {
                const isSelected = selectedOptions.includes(option);
                return (
                  <Button
                    key={option}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (isSelected) {
                        onChange(selectedOptions.filter((o) => o !== option));
                      } else {
                        onChange([...selectedOptions, option]);
                      }
                    }}
                    className="h-7"
                  >
                    {option}
                  </Button>
                );
              })}
            </div>
            {selectedOptions.length === 0 && (
              <p className="text-xs text-muted-foreground">Select one or more options</p>
            )}
          </div>
        );

      case 'collection_ref':
        const referencedCollection = availableCollections.find(
          (c) => c.id === property.referencedCollectionId
        );

        if (property.isMultiSelect) {
          // Multi-select collection reference
          const selectedIds = Array.isArray(value) ? value : value ? [value] : [];

          return (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Multi-select from {referencedCollection?.name || 'collection'}
              </div>
              <p className="text-xs text-muted-foreground italic">
                Note: Multi-select UI coming soon. Selected IDs will appear as reference tags.
              </p>
            </div>
          );
        }

        return (
          <Select
            value={(value as string) || 'none'}
            onValueChange={(val) => onChange(val === 'none' ? undefined : val)}
            required={property.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${referencedCollection?.name || 'item'}...`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {/* In a real app, this would fetch objects from the referenced collection */}
              <SelectItem value="placeholder">
                (Objects from {referencedCollection?.name || 'collection'} would appear here)
              </SelectItem>
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        {property.name}
        {property.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderField()}
    </div>
  );
}
