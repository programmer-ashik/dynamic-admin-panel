import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickColumnFilterProps {
  column: any; // TanStack table column
  propertyType?: string;
  options?: string[];
  onApplyFilter: (value: any) => void;
}

export function QuickColumnFilter({
  column,
  propertyType,
  options,
  onApplyFilter,
}: QuickColumnFilterProps) {
  const [open, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const hasFilter = column.getFilterValue() !== undefined;

  const handleApply = () => {
    if (propertyType === 'select' || propertyType === 'multiselect') {
      onApplyFilter(selectedOptions);
    } else if (propertyType === 'date') {
      onApplyFilter({ from: dateFrom, to: dateTo });
    } else {
      onApplyFilter(filterValue);
    }
    setOpen(false);
  };

  const handleClear = () => {
    setFilterValue('');
    setSelectedOptions([]);
    setDateFrom(undefined);
    setDateTo(undefined);
    column.setFilterValue(undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasFilter ? 'default' : 'ghost'}
          size="icon"
          className={cn('h-6 w-6 ml-1', hasFilter && 'bg-primary')}
        >
          <Filter className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Filter</h4>
            {hasFilter && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="h-6">
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Text/Number Filter */}
          {(!propertyType || propertyType === 'text' || propertyType === 'number') && (
            <div className="space-y-2">
              <Input
                placeholder="Filter value..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApply();
                }}
              />
            </div>
          )}

          {/* Select/Multiselect Filter */}
          {(propertyType === 'select' || propertyType === 'multiselect') && options && (
            <div className="space-y-2">
              {options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedOptions.includes(option)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedOptions([...selectedOptions, option]);
                      } else {
                        setSelectedOptions(selectedOptions.filter((o) => o !== option));
                      }
                    }}
                  />
                  <label className="text-sm cursor-pointer flex-1">{option}</label>
                </div>
              ))}
            </div>
          )}

          {/* Date Filter */}
          {propertyType === 'date' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">From Date</label>
                <Input
                  type="date"
                  value={dateFrom ? dateFrom.toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    setDateFrom(e.target.value ? new Date(e.target.value) : undefined)
                  }
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">To Date</label>
                <Input
                  type="date"
                  value={dateTo ? dateTo.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDateTo(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
            </div>
          )}

          <Button onClick={handleApply} className="w-full" size="sm">
            Apply Filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
