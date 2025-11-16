import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { cn } from "../../lib/utils";

interface MenuItemProps {
  item: any;
  collapsed: boolean;
  level?: number;
}

export function SidebarMenuItem({ item, collapsed, level = 0 }: MenuItemProps) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const hasChildren = item.children && item.children.length > 0;
  const Icon = (Icons as any)[item.icon] || Icons.Folder;

  const isActive = location.pathname === item.route;

  const handleClick = () => {
    if (hasChildren) return setOpen(!open);
    if (item.route) navigate(item.route);
  };

  return (
    <div className="relative group">
      {/* Menu button */}
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center w-full gap-2 p-2 rounded-md transition-colors",
          "hover:bg-accent",
          isActive && "bg-primary/20 text-primary font-semibold",
          level > 0 && "pl-4"
        )}
      >
        {/* Icon */}
        <Icon className="h-4 w-4 flex-shrink-0" />

        {/* Title (hidden in collapsed mode) */}
        {!collapsed && <span className="text-sm flex-1">{item.title}</span>}

        {/* Arrow for children */}
        {hasChildren && !collapsed && (
          <motion.span
            className="ml-auto"
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Icons.ChevronRight className="h-4 w-4" />
          </motion.span>
        )}

        {/* Tooltip for collapsed mode */}
        {collapsed && (
          <div className="
            absolute left-full top-1/2 -translate-y-1/2 ml-2 
            px-2 py-1 rounded bg-black text-white text-xs
            opacity-0 group-hover:opacity-100 
            whitespace-nowrap pointer-events-none
          ">
            {item.title}
          </div>
        )}
      </button>

      {/* Submenu */}
      {hasChildren && (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-4 pl-2 border-l border-muted/40 space-y-1"
            >
              {item.children.map((child: any) => (
                <SidebarMenuItem
                  key={child.id}
                  item={child}
                  collapsed={collapsed}
                  level={level + 1}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
