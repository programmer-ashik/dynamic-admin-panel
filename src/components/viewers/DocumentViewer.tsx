import { FileText, FileSpreadsheet, Image, Mail, Tag } from 'lucide-react';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { EmailViewer } from './EmailViewer';
import { WebsiteViewer } from './WebsiteViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useObjects } from '@/lib/query';
import { useTags } from '@/lib/query';
import { formatRelativeDate } from '@/lib/utils';
import type { MNoteObject, EmailMetadata } from '@/lib/types';

interface DocumentViewerProps {
  object: MNoteObject;
  content?: string;
  onContentUpdate?: (content: string) => void;
  showTaggedObjects?: boolean;
}

export function DocumentViewer({
  object,
  content = '',
  onContentUpdate,
  showTaggedObjects = true,
}: DocumentViewerProps) {
  const { data: objectsData } = useObjects({ wsId: object.wsId });
  const { data: tagsData } = useTags();

  const allObjects = objectsData?.items || [];
  const allTags = tagsData?.items || [];

  // Check if this object is an entity (has an entity tag associated with it)
  const entityTag = allTags.find((t) => t.kind === 'entity' && t.entityId === object.id);

  // Find all objects that reference this entity
  const taggedObjects = entityTag
    ? allObjects.filter((obj) => {
        if (obj.id === object.id) return false; // Exclude self
        const allObjTags = [...(obj.tags || []), ...(obj.referenceTags || [])];
        return allObjTags.some((t) => t.entityId === object.id || t.key === entityTag.slug);
      })
    : [];

  const renderContent = () => {
    const subType = object.documentSubType;

    // Website viewer
    if (object.type === 'website' && object.websiteUrl) {
      return (
        <WebsiteViewer
          url={object.websiteUrl}
          title={object.title}
          properties={object.properties}
        />
      );
    }

    // Email viewer
    if (object.type === 'email' && object.emailMetadata) {
      return (
        <EmailViewer
          metadata={object.emailMetadata as EmailMetadata}
          content={content || (object.properties?.body as string) || ''}
        />
      );
    }

    // Native MetaNote document
    if (!subType || subType === 'metanote') {
      return (
        <RichTextEditor
          content={content}
          onUpdate={onContentUpdate}
          placeholder="Start writing..."
        />
      );
    }

    // PDF viewer
    if (subType === 'pdf' && object.fileUrl) {
      return (
        <div className="h-full">
          <iframe
            src={object.fileUrl}
            className="w-full h-full border-0 rounded-lg"
            title={object.title}
          />
        </div>
      );
    }

    // Image viewer
    if (subType === 'image' && object.fileUrl) {
      return (
        <div className="flex items-center justify-center p-8">
          <img
            src={object.fileUrl}
            alt={object.title}
            className="max-w-full max-h-[80vh] rounded-lg shadow-lg"
          />
        </div>
      );
    }

    // Word/Excel/PowerPoint - Show file info
    if (['docx', 'xlsx', 'pptx'].includes(subType || '')) {
      const icons = {
        docx: <FileText className="h-12 w-12 text-blue-500" />,
        xlsx: <FileSpreadsheet className="h-12 w-12 text-green-500" />,
        pptx: <FileText className="h-12 w-12 text-orange-500" />,
      };

      return (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            {icons[subType as keyof typeof icons]}
            <div>
              <h3 className="font-semibold text-lg">{object.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {subType?.toUpperCase()} Document
              </p>
            </div>
            {object.fileUrl && (
              <a
                href={object.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Download File
              </a>
            )}
          </CardContent>
        </Card>
      );
    }

    // Text/Markdown - Show as plain text or markdown
    if (subType === 'txt' || subType === 'md') {
      return (
        <Card>
          <CardContent className="p-6">
            <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
          </CardContent>
        </Card>
      );
    }

    // Fallback for unknown types
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Preview not available for this file type</p>
          {object.fileUrl && (
            <a
              href={object.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline mt-4 inline-block"
            >
              Open File
            </a>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main content */}
      <div>{renderContent()}</div>

      {/* Related Objects Section (only for document types - non-documents show in sidebar) */}
      {showTaggedObjects && entityTag && (object.type === 'doc' || object.type === 'note') && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Related Objects
                </div>
                <a
                  href={`#/w/${object.wsId}/collections?tagSlugs=${entityTag.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  See all →
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {taggedObjects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No objects reference this entity yet
                </p>
              ) : (
                <div className="space-y-2">
                  {taggedObjects.slice(0, 5).map((obj) => (
                    <a
                      key={obj.id}
                      href={`#/w/${object.wsId}/object/${obj.id}`}
                      className="block p-3 border rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{obj.icon || '📄'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{obj.title}</div>
                          <div className="text-xs text-muted-foreground capitalize mt-0.5">
                            {obj.type} • {formatRelativeDate(obj.updatedAt)}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {obj.tags?.some((t) => t.entityId === object.id)
                            ? 'Direct tag'
                            : 'Reference tag'}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
              {taggedObjects.length > 5 && (
                <p className="text-xs text-muted-foreground mt-4">
                  Showing 5 of {taggedObjects.length} objects
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
