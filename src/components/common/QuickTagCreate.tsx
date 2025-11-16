import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
// import { useCreateTag, useTags } from '../../lib/query';
import { useToast } from '../../components/ui/use-toast';
import { useGetTagsQuery } from '../../store/features/navbar/tags/tabgsSlice';

export function QuickTagCreate() {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [parentId, setParentId] = useState<string>('');
  // const createTag = useCreateTag();
  const { data: tagsData } = useGetTagsQuery();
  const { toast } = useToast();

  const simpleTags = tagsData?.filter((t) => t.kind === 'simple') || [];

  const handleCreate = async () => {
    if (!label.trim()) return;

    await createTag.mutateAsync({
      label,
      parentId: parentId || undefined,
    });

    toast({
      title: 'Tag created',
      description: `"${label}" has been created.`,
    });

    setLabel('');
    setParentId('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1">
          <Plus className="h-3 w-3" />
          <span className="text-xs">New Tag</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-1">Quick Create Tag</h4>
            <p className="text-xs text-muted-foreground">Create a new tag with optional parent</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Tag Name</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Tag name..."
                className="h-8"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') setOpen(false);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Parent Tag (optional)</Label>
              <Select
                value={parentId || 'none'}
                onValueChange={(val) => setParentId(val === 'none' ? '' : val)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="None (root level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (root level)</SelectItem>
                  {simpleTags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" size="sm" onClick={handleCreate} disabled={!label.trim()}>
              <Check className="mr-2 h-3 w-3" />
              Create Tag
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
