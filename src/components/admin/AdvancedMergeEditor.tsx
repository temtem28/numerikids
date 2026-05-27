import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MergeEditorColumn } from './MergeEditorColumn';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';

interface AdvancedMergeEditorProps {
  baseVersion: any;
  currentVersion: any;
  incomingVersion: any;
  onMergeComplete: (mergedData: any) => void;
  onCancel: () => void;
}

export const AdvancedMergeEditor: React.FC<AdvancedMergeEditorProps> = ({
  baseVersion,
  currentVersion,
  incomingVersion,
  onMergeComplete,
  onCancel
}) => {
  const [mergedData, setMergedData] = useState<any>({});
  const [selectedFields, setSelectedFields] = useState<Record<string, string>>({});
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [manualEdit, setManualEdit] = useState<string>('');

  useEffect(() => {
    const conflictFields: string[] = [];
    const initial: any = { ...baseVersion };

    Object.keys(currentVersion).forEach(key => {
      if (JSON.stringify(currentVersion[key]) !== JSON.stringify(incomingVersion[key])) {
        conflictFields.push(key);
        initial[key] = currentVersion[key];
      } else {
        initial[key] = currentVersion[key];
      }
    });

    setConflicts(conflictFields);
    setMergedData(initial);
    setManualEdit(JSON.stringify(initial, null, 2));
  }, [baseVersion, currentVersion, incomingVersion]);

  const handleSelectField = (field: string, value: any, source: string) => {
    const updated = { ...mergedData, [field]: value };
    setMergedData(updated);
    setSelectedFields({ ...selectedFields, [field]: source });
    setManualEdit(JSON.stringify(updated, null, 2));
  };

  const handleManualEditChange = (value: string) => {
    setManualEdit(value);
    try {
      const parsed = JSON.parse(value);
      setMergedData(parsed);
    } catch (e) {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded">
        <AlertCircle className="w-5 h-5 text-amber-600" />
        <p className="text-sm text-amber-800">{conflicts.length} conflict(s) detected. Select changes from each version or edit manually.</p>
      </div>

      <Tabs defaultValue="compare" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compare">Three-Way Compare</TabsTrigger>
          <TabsTrigger value="preview">Preview & Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="compare" className="space-y-4">
          <div className="flex gap-4">
            <MergeEditorColumn title="Base Version" content={baseVersion} isBase conflicts={conflicts} />
            <MergeEditorColumn title="Your Changes" content={currentVersion} onSelect={(f, v) => handleSelectField(f, v, 'Your Changes')} conflicts={conflicts} selectedFields={selectedFields} />
            <MergeEditorColumn title="Their Changes" content={incomingVersion} onSelect={(f, v) => handleSelectField(f, v, 'Their Changes')} conflicts={conflicts} selectedFields={selectedFields} />
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Merged Result (Editable JSON)</label>
            <Textarea value={manualEdit} onChange={(e) => handleManualEditChange(e.target.value)} className="font-mono text-xs h-[400px]" />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onMergeComplete(mergedData)}>Apply Merge</Button>
      </div>
    </div>
  );
};
