import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, FileText, Folder } from 'lucide-react';
import { cn } from '../../lib/utils';
import { listWikiPages, listWikiGroups, getObject } from '../../mockData/mockdb';

export function WikiSection() {
  const { wsId = 'ws_default' } = useParams();
  const navigate = useNavigate();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const wikiPages = listWikiPages(wsId);
  const wikiGroups = listWikiGroups(wsId);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const rootPages = wikiPages.filter((p) => !p.groupId);
  const pagesByGroup = wikiGroups.reduce(
    (acc, group) => {
      acc[group.id] = wikiPages.filter((p) => p.groupId === group.id);
      return acc;
    },
    {} as Record<string, typeof wikiPages>,
  );

  return (
    <div className="space-y-1">
      {/* Wiki Groups (expandable) */}
      {wikiGroups.map((group) => {
        const pages = pagesByGroup[group.id] || [];
        const isExpanded = expandedGroups.has(group.id);

        return (
          <div key={group.id}>
            <button
              onClick={() => toggleGroup(group.id)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent/50 transition-colors text-left"
            >
              <ChevronRight
                className={cn('h-3 w-3 shrink-0 transition-transform', isExpanded && 'rotate-90')}
              />
              <span className="text-xs">{group.icon || '📁'}</span>
              <span className="truncate flex-1">{group.name}</span>
              <span className="text-xs text-muted-foreground">({pages.length})</span>
            </button>

            {isExpanded && (
              <div className="ml-6 mt-1 space-y-0.5">
                {pages.map((page) => {
                  const obj = getObject(page.objectId);
                  if (!obj) return null;
                  return (
                    <button
                      key={page.id}
                      onClick={() => navigate(`/w/${wsId}/wiki/${obj.id}`)}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs rounded-md hover:bg-accent/50 transition-colors text-left"
                    >
                      <span className="text-xs">{obj.icon || '📄'}</span>
                      <span className="truncate">{obj.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Root pages (ungrouped) */}
      {rootPages.length > 0 && (
        <>
          {wikiGroups.length > 0 && <div className="h-px bg-border my-1" />}
          {rootPages.map((page) => {
            const obj = getObject(page.objectId);
            if (!obj) return null;
            return (
              <button
                key={page.id}
                onClick={() => navigate(`/w/${wsId}/wiki/${obj.id}`)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent/50 transition-colors text-left"
              >
                <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="truncate">{obj.title}</span>
              </button>
            );
          })}
        </>
      )}

      {(wikiPages.length > 3 || wikiGroups.length > 2) && (
        <button
          onClick={() => navigate(`/w/${wsId}/wiki`)}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground rounded-md hover:bg-accent/50 transition-colors"
        >
          View all wiki pages →
        </button>
      )}
    </div>
  );
}
