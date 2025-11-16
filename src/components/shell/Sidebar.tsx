import { Plus, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { useDispatch } from 'react-redux';
import { sidebarCollapsed } from '../../store/features/global/globalSlice';
import { menu } from '../../shared/constant/menu.constant';
import { LucideIcon } from '../../shared/utils/Icon/LucideIconProps';
import { useState } from 'react';
import { cn } from '../../lib/utils';
interface SidebarProps {
  collapsed?: boolean;
}
export function Sidebar({ collapsed = false }: SidebarProps) {
  const dispatch = useDispatch();
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItem((prev) => (prev === id ? null : id));
  };
  const { wsId = 'ws_default' } = useParams();
  const navigate = useNavigate();
  const navbarMenu = menu || [];
  if (collapsed) {
    return (
      <div className="flex h-full flex-col border-r bg-card items-center py-4 gap-1">
        {/* Expand button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(sidebarCollapsed())}
          className="h-8 w-8 mb-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Separator className="mb-2 w-8" />
        <ScrollArea className="flex-col">
          <div className="space-y-4 p-4">
            {/* Icon menu only */}
            {navbarMenu.map((item) => {
              return (
                <button
                  key={item.id}
                  className="p-2 hover:bg-accent rounded-md"
                  title={item.title}
                  onClick={() => navigate(`/w/${wsId}/collections?collectionId=${item.id}`)}
                >
                  <LucideIcon name={item.icon} className="text-muted-foreground" />
                </button>
              );
            })}
            <Separator />
          </div>
        </ScrollArea>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col border-r bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <button
          onClick={() => navigate(`/w/${wsId}/dashboard`)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src="/logo.png" alt="MetaNote" className="h-6 w-6" />
          <span className="font-semibold">MetaNote</span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(sidebarCollapsed())}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
        </Button>
      </div>
      {/* MAIN SCROLL */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-2">
          <div>
            <div className="space-y-1">
              {navbarMenu.map((item) => {
                const isOpen = openItem === item.id;
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <div key={item.id}>
                    {/* MAIN ITEM */}
                    <button
                      onClick={() => {
                        if (hasChildren) {
                          toggleItem(item.id);
                        } else {
                          navigate(item.route);
                        }
                      }}
                      className={cn(
                        'group flex w-full items-center justify-between px-3 py-2 rounded-md hover:bg-accent transition',
                        location.pathname === item.route && 'bg-accent',
                      )}
                    >
                      {/* Left — icon + title */}
                      <div className="flex items-center gap-2">
                        <LucideIcon name={item.icon} />
                        <span>{item.title}</span>
                      </div>

                      {/* Chevron only if has children */}
                      {hasChildren && (
                        <motion.div
                          animate={{ rotate: isOpen ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </motion.div>
                      )}
                    </button>

                    {/* CHILDREN SECTION */}
                    <AnimatePresence>
                      {isOpen && hasChildren && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="ml-6 overflow-hidden"
                        >
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => navigate(child.route)}
                              className={cn(
                                'flex w-full items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent text-sm',
                                location.pathname === child.route && 'bg-accent',
                              )}
                            >
                              <LucideIcon name={child.icon || 'Dot'} className="h-3 w-3" />
                              {child.title}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
          <Separator />
        </div>
      </ScrollArea>

      {/* FOOTER */}
      <div className="border-t p-4">
        <Button variant="outline" className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Object
        </Button>
      </div>
    </div>
  );
}
