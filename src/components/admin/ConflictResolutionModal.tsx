import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, X } from 'lucide-react';
import { AdvancedMergeEditor } from './AdvancedMergeEditor';
import { useState } from 'react';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: any;
  incomingVersion: any;
  baseVersion?: any;
  onAcceptCurrent: () => void;
  onAcceptIncoming: () => void;
  onManualMerge: (mergedData: any) => void;
}

export function ConflictResolutionModal({
  isOpen,
  onClose,
  currentVersion,
  incomingVersion,
  baseVersion,
  onAcceptCurrent,
  onAcceptIncoming,
  onManualMerge
}: ConflictResolutionModalProps) {
  const [showAdvancedMerge, setShowAdvancedMerge] = useState(false);

  const findDifferences = () => {
    const diffs: any[] = [];
    
    if (currentVersion?.title !== incomingVersion?.title) {
      diffs.push({ field: 'Title', current: currentVersion?.title, incoming: incomingVersion?.title });
    }
    if (currentVersion?.description !== incomingVersion?.description) {
      diffs.push({ field: 'Description', current: currentVersion?.description, incoming: incomingVersion?.description });
    }
    
    return diffs;
  };

  const differences = findDifferences();

  const handleManualMergeClick = () => {
    setShowAdvancedMerge(true);
  };

  const handleMergeComplete = (mergedData: any) => {
    onManualMerge(mergedData);
    setShowAdvancedMerge(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            {showAdvancedMerge ? 'Advanced Merge Editor' : 'Conflict Detected'}
          </DialogTitle>
        </DialogHeader>
        
        {showAdvancedMerge ? (
          <AdvancedMergeEditor
            baseVersion={baseVersion || currentVersion}
            currentVersion={currentVersion}
            incomingVersion={incomingVersion}
            onMergeComplete={handleMergeComplete}
            onCancel={() => setShowAdvancedMerge(false)}
          />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Another educator has modified this quest while you were editing. Please review the changes and choose how to resolve the conflict.
            </p>

            <ScrollArea className="h-[400px] border rounded-lg p-4">
              <div className="space-y-4">
                {differences.map((diff, idx) => (
                  <div key={idx} className="border-b pb-4">
                    <Badge className="mb-2">{diff.field}</Badge>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-blue-600">Your Version</p>
                        <div className="bg-blue-50 p-3 rounded text-sm">{diff.current}</div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-green-600">Incoming Version</p>
                        <div className="bg-green-50 p-3 rounded text-sm">{diff.incoming}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button variant="secondary" onClick={handleManualMergeClick}>
                Advanced Merge Editor
              </Button>
              <Button variant="outline" onClick={onAcceptIncoming}>
                Accept Incoming
              </Button>
              <Button onClick={onAcceptCurrent}>
                <Check className="h-4 w-4 mr-2" />
                Keep Your Version
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

