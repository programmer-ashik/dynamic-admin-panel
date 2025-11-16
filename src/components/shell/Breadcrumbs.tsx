import { Link, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const location = useLocation();
  const { wsId = 'ws_default' } = useParams();
  const [searchParams] = useSearchParams();
  // const { data: collectionsData } = useCollections();

  // const collections = collectionsData?.items || [];
  // const collectionId = searchParams.get('collectionId');
  // const currentCollection = collections.find((c) => c.id === collectionId);
  const getPageName = () => {
    if (location.pathname.includes('/object/')) return 'Object';
    if (location.pathname.includes('/graph')) return 'Graph';
    if (location.pathname.includes('/tags')) return 'Tag Manager';
    if (location.pathname.includes('/wiki')) return 'Wiki';
    if (location.pathname.includes('/ai')) return 'AI Assistant';
    // if (currentCollection) return currentCollection.name;
    return 'All Objects';
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-default">
      <Link to={`/w/${wsId}/dashboard`} className="hover:text-foreground flex items-center gap-1">
        <Home className="h-3.5 w-3.5" />
        <span className="">Workspace</span>
      </Link>
      <ChevronRight className="h-4 w-4" />
      <span className="text-foreground">{getPageName()}</span>
    </div>
  );
}
