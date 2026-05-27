import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, GitBranch, Eye } from 'lucide-react';

interface Version {
  id: string;
  version_number: number;
  title: string;
  change_description: string;
  is_published: boolean;
  is_draft: boolean;
  created_at: string;
}

interface VersionHistoryModalProps {
  open: boolean;
  onClose: () => void;
  versions: Version[];
  onPublish: (versionId: string) => void;
  onRollback: (versionId: string) => void;
  onCompare: (versionId: string) => void;
  onViewVersion: (versionId: string) => void;
}

export default function VersionHistoryModal({
  open,
  onClose,
  versions,
  onPublish,
  onRollback,
  onCompare,
  onViewVersion
}: VersionHistoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Version History
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {versions.map((version) => (
            <div
              key={version.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">
                      Version {version.version_number}
                    </h3>
                    {version.is_published && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Published
                      </Badge>
                    )}
                    {version.is_draft && !version.is_published && (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {version.change_description || 'No description provided'}
                  </p>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(version.created_at).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewVersion(version.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  
                  {!version.is_published && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onPublish(version.id)}
                    >
                      Publish
                    </Button>
                  )}
                  
                  {!version.is_published && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onRollback(version.id)}
                    >
                      Rollback
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {versions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No versions yet. Save changes to create the first version.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}