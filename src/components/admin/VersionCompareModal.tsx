import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface Version {
  id: string;
  version_number: number;
  title: string;
  description: string;
  difficulty: string;
  estimated_duration: number;
}

interface Chapter {
  id: string;
  chapter_order: number;
  title: string;
  content: string;
  dialogues?: any[];
  objectives?: any[];
  rewards?: any[];
  branches?: any[];
}

interface VersionCompareModalProps {
  open: boolean;
  onClose: () => void;
  currentVersion: { version: Version; chapters: Chapter[] } | null;
  compareVersion: { version: Version; chapters: Chapter[] } | null;
}

export default function VersionCompareModal({
  open,
  onClose,
  currentVersion,
  compareVersion
}: VersionCompareModalProps) {
  if (!currentVersion || !compareVersion) return null;

  const getDiff = (field: string, current: any, compare: any) => {
    if (current === compare) return null;
    return { current, compare };
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Compare Version {currentVersion.version.version_number} vs Version {compareVersion.version.version_number}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div>
            <Badge className="mb-4">Version {currentVersion.version.version_number}</Badge>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Title</h3>
                <p className="text-sm">{currentVersion.version.title}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-sm">{currentVersion.version.description}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Difficulty</h3>
                <p className="text-sm">{currentVersion.version.difficulty}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Chapters</h3>
                <p className="text-sm">{currentVersion.chapters.length} chapters</p>
              </div>
            </div>
          </div>
          
          <div>
            <Badge className="mb-4">Version {compareVersion.version.version_number}</Badge>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Title</h3>
                <p className={`text-sm ${currentVersion.version.title !== compareVersion.version.title ? 'bg-yellow-100 p-1' : ''}`}>
                  {compareVersion.version.title}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className={`text-sm ${currentVersion.version.description !== compareVersion.version.description ? 'bg-yellow-100 p-1' : ''}`}>
                  {compareVersion.version.description}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Difficulty</h3>
                <p className={`text-sm ${currentVersion.version.difficulty !== compareVersion.version.difficulty ? 'bg-yellow-100 p-1' : ''}`}>
                  {compareVersion.version.difficulty}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Chapters</h3>
                <p className={`text-sm ${currentVersion.chapters.length !== compareVersion.chapters.length ? 'bg-yellow-100 p-1' : ''}`}>
                  {compareVersion.chapters.length} chapters
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Chapter Comparison</h3>
          <div className="space-y-2">
            {currentVersion.chapters.map((chapter, idx) => {
              const compareChapter = compareVersion.chapters[idx];
              const hasChanges = compareChapter && (
                chapter.title !== compareChapter.title ||
                chapter.content !== compareChapter.content
              );
              
              return (
                <div key={chapter.id} className={`p-3 border rounded ${hasChanges ? 'bg-yellow-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Chapter {chapter.chapter_order}</span>
                    {hasChanges && <Badge variant="secondary">Modified</Badge>}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                    <div>{chapter.title}</div>
                    <div>{compareChapter?.title || 'N/A'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}