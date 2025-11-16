import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, User, FileText, GitBranch, Eye, RotateCcw, CheckCircle2 } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import type { DocumentVersion } from '@/lib/versioning';

interface VersionHistoryProps {
  open: boolean;
  onClose: () => void;
  versions: DocumentVersion[];
  currentVersion: string;
  onRestore: (version: DocumentVersion) => void;
  onViewVersion: (version: DocumentVersion) => void;
}

export function VersionHistory({
  open,
  onClose,
  versions,
  currentVersion,
  onRestore,
  onViewVersion,
}: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);

  // Group by major version
  const versionsByMajor = versions.reduce((acc, version) => {
    const major = version.majorVersion;
    if (!acc[major]) {
      acc[major] = [];
    }
    acc[major].push(version);
    return acc;
  }, {} as Record<number, DocumentVersion[]>);

  const majorVersions = Object.keys(versionsByMajor)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Version History
            <Badge variant="outline" className="ml-2">
              {versions.length} version{versions.length !== 1 ? 's' : ''}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 h-[600px]">
          {/* Timeline - Left Side */}
          <ScrollArea className="flex-1 border-r pr-4">
            <div className="space-y-6 pb-4">
              {majorVersions.map((major) => {
                const majorVersionList = versionsByMajor[major];
                const majorVersion = majorVersionList.find((v) => v.minorVersion === 0);

                return (
                  <div key={major}>
                    {/* Major Version Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">{major}.0</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">Version {major}.0</div>
                        {majorVersion && (
                          <div className="text-xs text-muted-foreground">
                            {formatRelativeDate(majorVersion.createdAt)} • {majorVersion.author}
                          </div>
                        )}
                      </div>
                      {majorVersion?.versionNumber === currentVersion && (
                        <Badge>Current</Badge>
                      )}
                    </div>

                    {majorVersion?.changeDescription && (
                      <div className="ml-12 mb-3 text-sm text-muted-foreground italic">
                        "{majorVersion.changeDescription}"
                      </div>
                    )}

                    {/* Minor Versions */}
                    <div className="ml-12 space-y-2 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
                      
                      {majorVersionList
                        .filter((v) => v.minorVersion > 0)
                        .reverse()
                        .map((version) => (
                          <Card
                            key={version.id}
                            className={`cursor-pointer transition-colors ${
                              selectedVersion?.id === version.id
                                ? 'border-primary bg-primary/5'
                                : 'hover:bg-accent/50'
                            }`}
                            onClick={() => setSelectedVersion(version)}
                          >
                            <CardContent className="p-3 pl-6 relative">
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-muted-foreground border-2 border-background" />
                              
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-medium">
                                    v{version.versionNumber}
                                  </span>
                                  {version.versionNumber === currentVersion && (
                                    <Badge variant="secondary" className="text-xs">
                                      Current
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatRelativeDate(version.createdAt)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>{version.author}</span>
                              </div>
                              
                              {version.changeDescription && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  {version.changeDescription}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                    </div>

                    {major > Math.min(...majorVersions) && <Separator className="my-6" />}
                  </div>
                );
              })}

              {versions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No version history yet</p>
                  <p className="text-xs mt-1">Versions will be created automatically as you edit</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Version Details - Right Side */}
          <div className="w-80 space-y-4">
            {selectedVersion ? (
              <>
                <div>
                  <h3 className="font-semibold mb-2">Version {selectedVersion.versionNumber}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedVersion.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(selectedVersion.createdAt).toLocaleString()}</span>
                    </div>
                    {selectedVersion.isMajor && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Major Version
                      </Badge>
                    )}
                  </div>
                </div>

                {selectedVersion.changeDescription && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                        Change Description
                      </div>
                      <p className="text-sm">{selectedVersion.changeDescription}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onViewVersion(selectedVersion)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View This Version
                  </Button>
                  
                  {selectedVersion.versionNumber !== currentVersion && (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (confirm(`Restore version ${selectedVersion.versionNumber}? This will create a new major version.`)) {
                          onRestore(selectedVersion);
                        }
                      }}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore This Version
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Content Preview */}
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Content Preview
                  </div>
                  <ScrollArea className="h-[200px] border rounded-lg p-3 bg-muted/20">
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
                    />
                  </ScrollArea>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <FileText className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">Select a version to see details</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

