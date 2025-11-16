import { FileText, FileSpreadsheet, Image as ImageIcon, Mail, FileCode, Globe } from 'lucide-react';
import type { DocumentSubType } from '@/lib/types';

interface FileTypeIconProps {
  subType?: DocumentSubType;
  className?: string;
}

export function FileTypeIcon({ subType, className = 'h-4 w-4' }: FileTypeIconProps) {
  switch (subType) {
    case 'pdf':
      return <FileText className={`${className} text-red-500`} />;
    case 'docx':
      return <FileText className={`${className} text-blue-500`} />;
    case 'xlsx':
      return <FileSpreadsheet className={`${className} text-green-500`} />;
    case 'pptx':
      return <FileText className={`${className} text-orange-500`} />;
    case 'image':
      return <ImageIcon className={`${className} text-purple-500`} />;
    case 'email':
      return <Mail className={`${className} text-blue-400`} />;
    case 'txt':
    case 'md':
      return <FileCode className={`${className} text-gray-500`} />;
    case 'metanote':
      return <FileText className={`${className} text-primary`} />;
    default:
      return <FileText className={`${className} text-muted-foreground`} />;
  }
}

export function getFileTypeLabel(subType?: DocumentSubType): string {
  if (!subType || subType === 'metanote') return 'MetaNote';
  if (subType === 'pdf') return 'PDF';
  if (subType === 'docx') return 'Word';
  if (subType === 'xlsx') return 'Excel';
  if (subType === 'pptx') return 'PowerPoint';
  if (subType === 'image') return 'Image';
  if (subType === 'txt') return 'Text';
  if (subType === 'md') return 'Markdown';
  return subType.toUpperCase();
}
