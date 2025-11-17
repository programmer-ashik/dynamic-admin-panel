import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';
import { format, formatDistance, formatRelative } from 'date-fns';
import type { MenuItem } from '../shared/mockData/mockDataType';
/**
 * Utility to merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/**
 * Generate a unique ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
/**
 * Format date for display
 */
export function formatDate(date: string | Date, formatStr = 'PPP'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr);
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistance(d, new Date(), { addSuffix: true });
}

/**
 * Format date with relative context
 */
export function formatDateWithContext(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatRelative(d, new Date());
}

//-------------------------------------------menu utils for RBAC-----------------------------------
// filter menu by role
export const filterMenuByRole = (menu: MenuItem[], user: { role: string }): MenuItem[] => {
  return menu
    .filter((item) => {
      // If no roles specified, allow everyone
      if (!item.roles) return true;
      // Otherwise check if user.role exists in roles array
      return item.roles.includes(user.role);
    })
    .map((item) => {
      // Recursively filter children
      if (item.children) {
        return { ...item, children: filterMenuByRole(item.children, user) };
      }
      return item;
    });
};
// Role-check- function------------------------------
export const isLocked = (item: MenuItem, userRole: string): boolean => {
  if (!item.roles) return false;
  return !item.roles.includes(userRole);
};
