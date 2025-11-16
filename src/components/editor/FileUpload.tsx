import { useRef, useState } from 'react';
import { Upload, File, FileText, Sheet, Presentation, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatFileSize } from '@/lib/utils';
import type { DocumentSubType } from '@/lib/types';

interface FileUploadProps {
  onUpload: (file: File, subType: DocumentSubType) => void;
  className?: string;
}

export function FileUpload({ onUpload, className }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getSubTypeFromMime = (mimeType: string): DocumentSubType => {
    if (mimeType === 'application/pdf') return 'pdf';
    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    )
      return 'docx';
    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.ms-excel'
    )
      return 'xlsx';
    if (
      mimeType ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      mimeType === 'application/vnd.ms-powerpoint'
    )
      return 'pptx';
    if (mimeType === 'text/plain') return 'txt';
    if (mimeType === 'text/markdown') return 'md';
    return 'other';
  };

  const handleFile = (file: File) => {
    const subType = getSubTypeFromMime(file.type);
    onUpload(file, subType);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <Card
      className={cn(
        'border-2 border-dashed transition-colors',
        isDragging && 'border-primary bg-primary/5',
        className
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          
          <div>
            <h3 className="font-semibold mb-1">Upload a file</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop or click to browse
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            Select File
          </Button>

          <div className="text-xs text-muted-foreground">
            Supported: PDF, Word, Excel, PowerPoint, Text, Markdown
          </div>

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md"
            onChange={handleFileInput}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface FilePreviewProps {
  fileName: string;
  fileSize?: number;
  fileUrl?: string;
  subType: DocumentSubType;
  onRemove?: () => void;
}

export function FilePreview({ fileName, fileSize, fileUrl, subType, onRemove }: FilePreviewProps) {
  const getIcon = () => {
    switch (subType) {
      case 'pdf':
        return <File className="h-8 w-8 text-red-500" />;
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'xlsx':
        return <Sheet className="h-8 w-8 text-green-500" />;
      case 'pptx':
        return <Presentation className="h-8 w-8 text-orange-500" />;
      default:
        return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="shrink-0">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{fileName}</div>
            {fileSize && (
              <div className="text-sm text-muted-foreground">{formatFileSize(fileSize)}</div>
            )}
          </div>
          {onRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              Remove
            </Button>
          )}
          {fileUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                Open
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

