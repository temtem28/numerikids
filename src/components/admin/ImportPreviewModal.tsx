import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ImportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quests: any[];
  isValid: boolean;
  errors: string[];
}

export default function ImportPreviewModal({ open, onClose, onConfirm, quests, isValid, errors }: ImportPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Import Preview
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh]">
          {!isValid && errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">Validation Errors</h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {isValid && quests.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {quests.length} quest{quests.length !== 1 ? 's' : ''} ready to import
              </p>
              {quests.map((questData, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{questData.quest?.title || 'Untitled Quest'}</h4>
                      <p className="text-sm text-muted-foreground">{questData.quest?.description}</p>
                    </div>
                    <Badge>{questData.quest?.difficulty_level}</Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{questData.chapters?.length || 0} chapters</span>
                    <span>{questData.dialogues?.length || 0} dialogues</span>
                    <span>{questData.objectives?.length || 0} objectives</span>
                    <span>{questData.branches?.length || 0} branches</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm} disabled={!isValid}>
            Import {quests.length} Quest{quests.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
