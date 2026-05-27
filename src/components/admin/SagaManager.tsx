import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, Download, Upload, CheckSquare, Square, GitBranch, Save } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { QuestBuilder } from './QuestBuilder';
import ImportPreviewModal from './ImportPreviewModal';
import { 
  exportQuestToJSON, 
  exportMultipleQuestsToJSON, 
  downloadJSON, 
  validateQuestStructure,
  validateBulkQuestStructure 
} from '@/utils/sagaExportImport';

export default function SagaManager() {
  const [quests, setQuests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [selectedQuestIds, setSelectedQuestIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importData, setImportData] = useState<any>(null);
  const [importValidation, setImportValidation] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();


  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('saga-manager', {
      body: { action: 'list_quests' }
    });
    if (!error && data) {
      setQuests(data.quests || []);
    }
    setLoading(false);
  };

  const deleteQuest = async (questId: string) => {
    if (!confirm('Delete this quest? This will remove all chapters and content.')) return;
    const { error } = await supabase.functions.invoke('saga-manager', {
      body: { action: 'delete_quest', data: { questId } }
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Quest deleted!' });
      loadQuests();
    }
  };

  const toggleQuestSelection = (questId: string) => {
    const newSelection = new Set(selectedQuestIds);
    if (newSelection.has(questId)) {
      newSelection.delete(questId);
    } else {
      newSelection.add(questId);
    }
    setSelectedQuestIds(newSelection);
  };

  const selectAllQuests = () => {
    setSelectedQuestIds(new Set(filteredQuests.map(q => q.id)));
  };

  const deselectAllQuests = () => {
    setSelectedQuestIds(new Set());
  };

  const handleBulkExport = async () => {
    if (selectedQuestIds.size === 0) {
      toast({ title: 'No Selection', description: 'Please select quests to export', variant: 'destructive' });
      return;
    }

    toast({ title: 'Exporting...', description: `Preparing ${selectedQuestIds.size} quests for export` });
    const exportData = await exportMultipleQuestsToJSON(Array.from(selectedQuestIds));
    
    if (exportData) {
      const filename = `bulk_quests_${Date.now()}.json`;
      downloadJSON(exportData, filename);
      toast({ title: 'Success', description: `${exportData.totalQuests} quests exported successfully!` });
      deselectAllQuests();
    } else {
      toast({ title: 'Error', description: 'Failed to export quests', variant: 'destructive' });
    }
  };

  const handleExportAll = async () => {
    if (quests.length === 0) {
      toast({ title: 'No Quests', description: 'No quests available to export', variant: 'destructive' });
      return;
    }

    toast({ title: 'Exporting...', description: `Preparing all ${quests.length} quests for export` });
    const exportData = await exportMultipleQuestsToJSON(quests.map(q => q.id));
    
    if (exportData) {
      const filename = `all_quests_${Date.now()}.json`;
      downloadJSON(exportData, filename);
      toast({ title: 'Success', description: `${exportData.totalQuests} quests exported successfully!` });
    } else {
      toast({ title: 'Error', description: 'Failed to export quests', variant: 'destructive' });
    }
  };

  const handleExportQuest = async (questId: string, questTitle: string) => {
    toast({ title: 'Exporting...', description: 'Preparing quest data for export' });
    const exportData = await exportQuestToJSON(questId);
    if (exportData) {
      const filename = `${questTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`;
      downloadJSON(exportData, filename);
      toast({ title: 'Success', description: 'Quest exported successfully!' });
    } else {
      toast({ title: 'Error', description: 'Failed to export quest', variant: 'destructive' });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Check if it's a bulk import or single quest
      if (data.quests && Array.isArray(data.quests)) {
        // Bulk import
        const validation = validateBulkQuestStructure(data);
        setImportData(data);
        setImportValidation(validation);
        setShowImportPreview(true);
      } else {
        // Single quest import
        const validation = validateQuestStructure(data);
        if (!validation.valid) {
          toast({
            title: 'Invalid Quest File',
            description: validation.errors.join(', '),
            variant: 'destructive'
          });
          return;
        }
        setImportData({ quests: [data] });
        setImportValidation({ valid: true, errors: [], questCount: 1 });
        setShowImportPreview(true);
      }
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Invalid JSON file',
        variant: 'destructive'
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmImport = async () => {
    if (!importData || !importValidation?.valid) return;

    setImporting(true);
    setShowImportPreview(false);

    try {
      const questsToImport = importData.quests || [];
      let successCount = 0;

      for (const questData of questsToImport) {
        try {
          await importQuest(questData);
          successCount++;
        } catch (error) {
          console.error('Failed to import quest:', error);
        }
      }

      toast({ 
        title: 'Success', 
        description: `${successCount} of ${questsToImport.length} quests imported successfully!` 
      });
      loadQuests();
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import quests',
        variant: 'destructive'
      });
    }

    setImporting(false);
    setImportData(null);
    setImportValidation(null);
  };


  const importQuest = async (data: any) => {
    const questData = { ...data.quest };
    delete questData.id;
    delete questData.created_at;
    delete questData.updated_at;

    const { data: newQuest, error: questError } = await supabase.functions.invoke('saga-manager', {
      body: { action: 'create_quest', data: questData }
    });

    if (questError || !newQuest?.quest) throw new Error('Failed to create quest');

    const newQuestId = newQuest.quest.id;
    const chapterIdMap = new Map();

    for (const chapter of data.chapters) {
      const oldChapterId = chapter.id;
      const chapterData = { ...chapter, quest_id: newQuestId };
      delete chapterData.id;
      delete chapterData.created_at;

      const { data: newChapter } = await supabase.functions.invoke('saga-manager', {
        body: { action: 'create_chapter', data: chapterData }
      });

      if (newChapter?.chapter) {
        chapterIdMap.set(oldChapterId, newChapter.chapter.id);
      }
    }

    for (const dialogue of data.dialogues) {
      const newChapterId = chapterIdMap.get(dialogue.chapter_id);
      if (newChapterId) {
        const dialogueData = { ...dialogue, chapter_id: newChapterId };
        delete dialogueData.id;
        delete dialogueData.created_at;
        await supabase.functions.invoke('saga-manager', {
          body: { action: 'create_dialogue', data: dialogueData }
        });
      }
    }

    for (const objective of data.objectives) {
      const newChapterId = chapterIdMap.get(objective.chapter_id);
      if (newChapterId) {
        const objectiveData = { ...objective, chapter_id: newChapterId };
        delete objectiveData.id;
        delete objectiveData.created_at;
        await supabase.functions.invoke('saga-manager', {
          body: { action: 'create_objective', data: objectiveData }
        });
      }
    }

    for (const reward of data.rewards) {
      const newChapterId = chapterIdMap.get(reward.chapter_id);
      if (newChapterId) {
        const rewardData = { ...reward, chapter_id: newChapterId };
        delete rewardData.id;
        delete rewardData.created_at;
        await supabase.functions.invoke('saga-manager', {
          body: { action: 'create_reward', data: rewardData }
        });
      }
    }

    for (const branch of data.branches) {
      const fromChapterId = chapterIdMap.get(branch.from_chapter_id);
      const toChapterId = chapterIdMap.get(branch.to_chapter_id);
      if (fromChapterId && toChapterId) {
        const branchData = { ...branch, from_chapter_id: fromChapterId, to_chapter_id: toChapterId };
        delete branchData.id;
        delete branchData.created_at;
        await supabase.functions.invoke('saga-manager', {
          body: { action: 'create_branch', data: branchData }
        });
      }
    }
  };

  const filteredQuests = quests.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedQuestId !== null) {
    return <QuestBuilder questId={selectedQuestId === 'new' ? undefined : selectedQuestId} onBack={() => { setSelectedQuestId(null); loadQuests(); }} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Saga Quest Manager</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportClick} disabled={importing}>
            <Upload className="mr-2 h-4 w-4" />
            {importing ? 'Importing...' : 'Import Quests'}
          </Button>
          <Button onClick={() => setSelectedQuestId('new')}>
            <Plus className="mr-2 h-4 w-4" />Create Quest
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {selectedQuestIds.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              {selectedQuestIds.size} quest{selectedQuestIds.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={deselectAllQuests}>
              Deselect All
            </Button>
            <Button size="sm" onClick={handleBulkExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Selected
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search quests..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {filteredQuests.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={selectAllQuests}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportAll}>
                <Download className="mr-2 h-4 w-4" />
                Export All
              </Button>
            </>
          )}
        </div>
      </div>


      <div className="grid gap-4">
        {filteredQuests.map((quest) => (
          <Card key={quest.id} className="p-6">
            <div className="flex gap-4 items-start">
              <div className="pt-1">
                <Checkbox
                  checked={selectedQuestIds.has(quest.id)}
                  onCheckedChange={() => toggleQuestSelection(quest.id)}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{quest.title}</h3>
                  <Badge variant={quest.is_published ? 'default' : 'secondary'}>
                    {quest.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <Badge variant="outline">{quest.difficulty_level}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{quest.description}</p>
                <p className="text-xs text-muted-foreground">Duration: {quest.estimated_duration} min</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleExportQuest(quest.id, quest.title)} title="Export Quest">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedQuestId(quest.id)} title="Edit Quest">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteQuest(quest.id)} title="Delete Quest">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredQuests.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No quests found. Create your first saga quest!</p>
        </div>
      )}

      <ImportPreviewModal
        open={showImportPreview}
        onClose={() => {
          setShowImportPreview(false);
          setImportData(null);
          setImportValidation(null);
        }}
        onConfirm={confirmImport}
        quests={importData?.quests || []}
        isValid={importValidation?.valid || false}
        errors={importValidation?.errors || []}
      />
    </div>
  );
}
