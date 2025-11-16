import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, Users } from 'lucide-react';
import { useTags } from '@/lib/query';

interface SecurityTagIndicatorProps {
  securityTagId?: string;
  isInherited?: boolean; // From collection default
  size?: 'sm' | 'md' | 'lg';
}

export function SecurityTagIndicator({ securityTagId, isInherited, size = 'sm' }: SecurityTagIndicatorProps) {
  const { data: tagsData } = useTags();
  const tags = tagsData?.items || [];
  
  if (!securityTagId) return null;
  
  const securityTag = tags.find(t => t.id === securityTagId && t.kind === 'security');
  
  if (!securityTag) return null;
  
  return (
    <Badge
      variant={isInherited ? 'outline' : 'default'}
      className={`gap-1 ${
        size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
      }`}
    >
      <Shield className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`} />
      {securityTag.label}
      {isInherited && <span className="text-xs opacity-70">(inherited)</span>}
    </Badge>
  );
}

export function getSecurityIcon(label: string) {
  if (label.toLowerCase().includes('public')) return Eye;
  if (label.toLowerCase().includes('restricted')) return Lock;
  if (label.toLowerCase().includes('team')) return Users;
  return Shield;
}

