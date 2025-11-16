import { useState } from 'react';
import { Plus, X, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useTags } from '@/lib/query';
import { generateId, cn } from '@/lib/utils';
import type { FilterGroup, FilterCondition, FilterOperator, Tag } from '@/lib/types';

interface FilterBuilderProps {
  filter: FilterGroup;
  onChange: (filter: FilterGroup) => void;
  availableFields: Array<{ value: string; label: string; type: string }>;
}

export function FilterBuilder({ filter, onChange, availableFields }: FilterBuilderProps) {
  const addCondition = (groupId: string) => {
    const newCondition: FilterCondition = {
      id: generateId('cond'),
      field: 'title',
      operator: 'in',
      value: '',
    };

    const updateGroup = (group: FilterGroup): FilterGroup => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: [...group.conditions, newCondition],
        };
      }
      return {
        ...group,
        conditions: group.conditions.map((cond) =>
          'operator' in cond && 'conditions' in cond ? updateGroup(cond) : cond
        ),
      };
    };

    onChange(updateGroup(filter));
  };

  const addGroup = (parentGroupId: string) => {
    const newGroup: FilterGroup = {
      id: generateId('group'),
      operator: 'AND',
      conditions: [],
    };

    const updateGroup = (group: FilterGroup): FilterGroup => {
      if (group.id === parentGroupId) {
        return {
          ...group,
          conditions: [...group.conditions, newGroup],
        };
      }
      return {
        ...group,
        conditions: group.conditions.map((cond) =>
          'operator' in cond && 'conditions' in cond ? updateGroup(cond) : cond
        ),
      };
    };

    onChange(updateGroup(filter));
  };

  const updateCondition = (conditionId: string, updates: Partial<FilterCondition>) => {
    const updateInGroup = (group: FilterGroup): FilterGroup => {
      return {
        ...group,
        conditions: group.conditions.map((cond) => {
          if ('field' in cond && cond.id === conditionId) {
            return { ...cond, ...updates };
          }
          if ('operator' in cond && 'conditions' in cond) {
            return updateInGroup(cond);
          }
          return cond;
        }),
      };
    };

    onChange(updateInGroup(filter));
  };

  const removeCondition = (conditionId: string) => {
    const removeFromGroup = (group: FilterGroup): FilterGroup => {
      return {
        ...group,
        conditions: group.conditions
          .filter((cond) => cond.id !== conditionId)
          .map((cond) =>
            'operator' in cond && 'conditions' in cond ? removeFromGroup(cond) : cond
          ),
      };
    };

    onChange(removeFromGroup(filter));
  };

  const toggleGroupOperator = (groupId: string) => {
    const updateGroup = (group: FilterGroup): FilterGroup => {
      if (group.id === groupId) {
        return {
          ...group,
          operator: group.operator === 'AND' ? 'OR' : 'AND',
        };
      }
      return {
        ...group,
        conditions: group.conditions.map((cond) =>
          'operator' in cond && 'conditions' in cond ? updateGroup(cond) : cond
        ),
      };
    };

    onChange(updateGroup(filter));
  };

  return (
    <div className="space-y-3">
      <FilterGroupComponent
        group={filter}
        onAddCondition={addCondition}
        onAddGroup={addGroup}
        onUpdateCondition={updateCondition}
        onRemoveCondition={removeCondition}
        onToggleOperator={toggleGroupOperator}
        availableFields={availableFields}
        isRoot
      />
    </div>
  );
}

interface FilterGroupComponentProps {
  group: FilterGroup;
  onAddCondition: (groupId: string) => void;
  onAddGroup: (groupId: string) => void;
  onUpdateCondition: (conditionId: string, updates: Partial<FilterCondition>) => void;
  onRemoveCondition: (conditionId: string) => void;
  onToggleOperator: (groupId: string) => void;
  availableFields: Array<{ value: string; label: string; type: string }>;
  isRoot?: boolean;
}

function FilterGroupComponent({
  group,
  onAddCondition,
  onAddGroup,
  onUpdateCondition,
  onRemoveCondition,
  onToggleOperator,
  availableFields,
  isRoot = false,
}: FilterGroupComponentProps) {
  return (
    <Card className={cn(!isRoot && 'ml-4 border-l-4 border-l-primary/30')}>
      <CardContent className="p-3 space-y-2">
        {/* Group operator toggle */}
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleOperator(group.id)}
            className="h-6 text-xs font-mono"
          >
            {group.operator}
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddCondition(group.id)}
              className="h-6 text-xs"
            >
              <Plus className="mr-1 h-3 w-3" />
              Condition
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddGroup(group.id)}
              className="h-6 text-xs"
            >
              <Plus className="mr-1 h-3 w-3" />
              Group
            </Button>
          </div>
        </div>

        {/* Conditions */}
        <div className="space-y-2">
          {group.conditions.map((condition, index) => (
            <div key={condition.id}>
              {index > 0 && (
                <div className="text-xs text-muted-foreground text-center py-1 font-mono">
                  {group.operator}
                </div>
              )}
              {'field' in condition ? (
                <FilterConditionComponent
                  condition={condition}
                  onUpdate={onUpdateCondition}
                  onRemove={onRemoveCondition}
                  availableFields={availableFields}
                />
              ) : (
                <FilterGroupComponent
                  group={condition}
                  onAddCondition={onAddCondition}
                  onAddGroup={onAddGroup}
                  onUpdateCondition={onUpdateCondition}
                  onRemoveCondition={onRemoveCondition}
                  onToggleOperator={onToggleOperator}
                  availableFields={availableFields}
                />
              )}
            </div>
          ))}
        </div>

        {group.conditions.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            No conditions yet. Click "Add Condition" to start.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface FilterConditionComponentProps {
  condition: FilterCondition;
  onUpdate: (id: string, updates: Partial<FilterCondition>) => void;
  onRemove: (id: string) => void;
  availableFields: Array<{ value: string; label: string; type: string }>;
}

function FilterConditionComponent({
  condition,
  onUpdate,
  onRemove,
  availableFields,
}: FilterConditionComponentProps) {
  const { data: tagsData } = useTags();
  const allTags = tagsData?.items || [];

  const selectedField = availableFields.find((f) => f.value === condition.field);

  const operatorsByType: Record<string, FilterOperator[]> = {
    text: [
      'contains',
      'not_contains',
      'equals',
      'not_equals',
      'starts_with',
      'ends_with',
      'is_empty',
      'is_not_empty',
    ],
    number: ['equals', 'not_equals', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'],
    select: ['equals', 'not_equals', 'in', 'not_in', 'is_empty', 'is_not_empty'],
    tag: ['in', 'not_in', 'is_empty', 'is_not_empty'],
    date: ['equals', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'],
  };

  const availableOperators = operatorsByType[selectedField?.type || 'text'] || operatorsByType.text;

  const needsValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
  const isTagField = condition.field === 'tags';

  return (
    <div className="flex items-center gap-2 p-2 border rounded-md bg-background">
      <Select
        value={condition.field}
        onValueChange={(value) => onUpdate(condition.id, { field: value, value: undefined })}
      >
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableFields.map((field) => (
            <SelectItem key={field.value} value={field.value}>
              {field.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={condition.operator}
        onValueChange={(value: FilterOperator) => onUpdate(condition.id, { operator: value })}
      >
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableOperators.map((op) => (
            <SelectItem key={op} value={op}>
              {op.replace(/_/g, ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {needsValue && isTagField && (
        <TagSelector
          tags={allTags}
          value={condition.value as string}
          onChange={(value) => onUpdate(condition.id, { value })}
        />
      )}

      {needsValue && !isTagField && (
        <Input
          value={(condition.value as string) || ''}
          onChange={(e) => onUpdate(condition.id, { value: e.target.value })}
          placeholder="Value..."
          className="h-8 flex-1"
        />
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(condition.id)}
        className="h-8 w-8 shrink-0"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

interface TagSelectorProps {
  tags: Tag[];
  value: string;
  onChange: (value: string) => void;
}

function TagSelector({ tags, value, onChange }: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedSlugs = value ? value.split(',').filter(Boolean) : [];

  const toggleTag = (slug: string) => {
    let newSlugs: string[];
    if (selectedSlugs.includes(slug)) {
      newSlugs = selectedSlugs.filter((s) => s !== slug);
    } else {
      newSlugs = [...selectedSlugs, slug];
    }
    onChange(newSlugs.join(','));
  };

  const selectedTags = tags.filter((t) => selectedSlugs.includes(t.slug));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-8 flex-1 justify-start">
          {selectedTags.length === 0 ? (
            <span className="text-muted-foreground">Select tags...</span>
          ) : (
            <div className="flex items-center gap-1 flex-wrap">
              {selectedTags.slice(0, 2).map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.label}
                </Badge>
              ))}
              {selectedTags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{selectedTags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search tags..." />
          <CommandList>
            <CommandEmpty>No tags found.</CommandEmpty>
            <CommandGroup>
              {tags.map((tag) => {
                const isSelected = selectedSlugs.includes(tag.slug);
                return (
                  <CommandItem key={tag.id} onSelect={() => toggleTag(tag.slug)}>
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    <span className={cn(tag.kind === 'entity' && 'text-primary')}>{tag.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground capitalize">
                      {tag.kind}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
