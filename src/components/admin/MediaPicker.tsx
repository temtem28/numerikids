import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MediaUploader from './MediaUploader';
import MediaLibrary from './MediaLibrary';
import { Button } from '@/components/ui/button';

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
}

export default function MediaPicker({ open, onClose, onSelect, title = 'Select Media' }: MediaPickerProps) {
  const [selectedUrl, setSelectedUrl] = useState<string>('');

  const handleSelect = (url: string) => {
    setSelectedUrl(url);
  };

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
      setSelectedUrl('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="library">
          <TabsList className="w-full">
            <TabsTrigger value="library" className="flex-1">Media Library</TabsTrigger>
            <TabsTrigger value="upload" className="flex-1">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-4">
            <MediaLibrary onSelect={handleSelect} />
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <MediaUploader onUploadComplete={(url) => {
              setSelectedUrl(url);
            }} />
          </TabsContent>
        </Tabs>

        {selectedUrl && (
          <div className="mt-4 p-4 bg-slate-100 rounded">
            <p className="text-sm text-slate-600 mb-2">Selected:</p>
            <p className="text-xs font-mono break-all">{selectedUrl}</p>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!selectedUrl}>
            Select Media
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
