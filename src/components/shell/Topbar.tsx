import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';
import { SearchInput } from '../common/SearchInput';
import { useState } from 'react';
import { Button } from '../ui/button';
import { PanelRightClose, Plus, Sparkles } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { setAiPanelOpen, setRightPanelOpen } from '../../store/features/global/globalSlice';

interface TopbarProps {
  onOpenCreate?: (file?: File) => void;
}

export function Topbar({ onOpenCreate }: TopbarProps = {}) {
  const dispatch = useDispatch();
  const rightPanelOpen = useSelector((state: RootState) => state.global.rightPanelOpen);
  const aiPaneOpen = useSelector((state: RootState) => state.global.aiPanelOpen);

  const { wsId = 'ws_default' } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      navigate(`/w/${wsId}?q=${encodeURIComponent(value)}`);
    } else {
      navigate(`/w/${wsId}`);
    }
  };

  return (
    <>
      <div className="flex h-16 items-center justify-between border-b bg-card px-6 py-4">
        {/* Breadcrumbs */}
        <Breadcrumbs />

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-8">
          <SearchInput
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search objects..."
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant={aiPaneOpen ? 'default' : 'ghost'}
            size="icon"
            onClick={() => {
              dispatch(setAiPanelOpen());
            }}
            title="AI Assistant"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(setRightPanelOpen())}
            title={rightPanelOpen ? 'Hide details' : 'Show details'}
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            // onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
