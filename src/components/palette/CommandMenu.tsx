import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useUIStore } from '@/lib/store';
import { useObjects } from '@/lib/query';
import {
  FileText,
  Search,
  Settings,
  Moon,
  Sun,
  Network,
  Plus,
  Command,
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';

export function CommandMenu() {
  const navigate = useNavigate();
  const { wsId = 'ws_default' } = useParams();
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState('');

  const commandOpen = useUIStore((state) => state.commandOpen);
  const setCommandOpen = useUIStore((state) => state.setCommandOpen);
  const setCreateDialogOpen = useUIStore((state) => state.setCreateDialogOpen);
  const setShortcutsDialogOpen = useUIStore((state) => state.setShortcutsDialogOpen);

  const { data: objectsData } = useObjects({ wsId, q: search });
  const objects = objectsData?.items || [];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [commandOpen, setCommandOpen]);

  const handleSelect = (callback: () => void) => {
    setCommandOpen(false);
    callback();
  };

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Actions */}
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => handleSelect(() => setCreateDialogOpen(true))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Object</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate(`/w/${wsId}/graph`))}>
            <Network className="mr-2 h-4 w-4" />
            <span>Open Graph</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate(`/w/${wsId}/tags`))}>
            <Command className="mr-2 h-4 w-4" />
            <span>Tag Manager</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => setShortcutsDialogOpen(true))}>
            <Command className="mr-2 h-4 w-4" />
            <span>Keyboard Shortcuts</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Theme */}
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => handleSelect(() => setTheme('light'))}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => setTheme('dark'))}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => setTheme('system'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>System</span>
          </CommandItem>
        </CommandGroup>

        {/* Objects */}
        {search && objects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Objects">
              {objects.slice(0, 10).map((obj) => (
                <CommandItem
                  key={obj.id}
                  onSelect={() => handleSelect(() => navigate(`/w/${wsId}/object/${obj.id}`))}
                >
                  <span className="mr-2">{obj.icon || '📄'}</span>
                  <span>{obj.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground capitalize">
                    {obj.type}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

