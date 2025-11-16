import * as Icons from "lucide-react";
import { cn } from "../../../lib/utils";

interface LucideIconProps {
  name?: string;
  className?: string;
}

/**
 * Lucide icon resolver:
 * - Safely checks if the icon exists
 * - Falls back to Circle icon
 */
export function LucideIcon({ name = "", className }: LucideIconProps) {
  const Icon = (Icons as Record<string, any>)[name];

  // Debug: show which icons fail
  if (!Icon) {
    console.warn(`⚠️ Lucide icon not found: "${name}"`);
  }

  const FinalIcon = Icon || Icons.Circle;

  return <FinalIcon className={cn("w-4 h-4", className)} />;
}
