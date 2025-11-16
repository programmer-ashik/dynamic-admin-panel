import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTags } from '@/lib/query';
import type { FilterGroup, FilterCondition } from '@/lib/types';

interface ActiveFiltersProps {
  filter: FilterGroup;
  onClear: () => void;
  onRemoveCondition: (conditionId: string) => void;
}

export function ActiveFilters({ filter, onClear, onRemoveCondition }: ActiveFiltersProps) {
  const { data: tagsData } = useTags();
  const allTags = tagsData?.items || [];

  const flatConditions = getFlatConditions(filter);

  if (flatConditions.length === 0) {
    return null;
  }

  const getDisplayValue = (condition: FilterCondition) => {
    if (condition.field === 'tags' && condition.value) {
      const slugs = String(condition.value).split(',').filter(Boolean);
      const tagLabels = slugs
        .map((slug) => allTags.find((t) => t.slug === slug)?.label || slug)
        .join(', ');
      return tagLabels;
    }
    return condition.value ? String(condition.value) : '';
  };

  return (
    <div className="flex items-center gap-2 flex-wrap p-3 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="font-medium">
          {flatConditions.length} active filter{flatConditions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {flatConditions.map((condition) => {
        const displayValue = getDisplayValue(condition);
        return (
          <Badge key={condition.id} variant="secondary" className="gap-1 pr-1">
            <span className="font-medium capitalize">{condition.field}</span>
            <span className="text-muted-foreground text-xs">
              {condition.operator.replace(/_/g, ' ')}
            </span>
            {displayValue && <span className="font-normal">{displayValue}</span>}
            <button
              onClick={() => onRemoveCondition(condition.id)}
              className="ml-1 rounded-sm hover:bg-background/50 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}

      <Button variant="ghost" size="sm" onClick={onClear} className="h-6 ml-auto">
        Clear all
      </Button>
    </div>
  );
}

function getFlatConditions(group: FilterGroup): FilterCondition[] {
  const conditions: FilterCondition[] = [];

  for (const condition of group.conditions) {
    if ('field' in condition) {
      conditions.push(condition);
    } else if ('conditions' in condition) {
      conditions.push(...getFlatConditions(condition));
    }
  }

  return conditions;
}
