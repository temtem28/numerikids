import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { DialogueEditor } from './DialogueEditor';
import { ObjectiveEditor } from './ObjectiveEditor';
import { RewardEditor } from './RewardEditor';
import { BranchEditor } from './BranchEditor';
import { CommentThread } from './CommentThread';
import { CursorAwareInput } from './CursorAwareInput';
import { useCursorTracking } from '@/hooks/useCursorTracking';


interface ChapterEditorProps {
  chapterId: string;
  questId: string;
  onBack: () => void;
}

export function ChapterEditor({ chapterId, questId, onBack }: ChapterEditorProps) {
  const [chapter, setChapter] = useState({ title: '', description: '', order_index: 0, background_image_url: '', background_music_url: '' });
  const [dialogues, setDialogues] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { cursors, broadcastCursor } = useCursorTracking(
    questId,
    sessionId || '',
    currentUser?.id || '',
    currentUser?.user_metadata?.name || currentUser?.email || 'Anonymous',
    currentUser?.email || ''
  );


  useEffect(() => {
    loadCurrentUser();
    if (chapterId !== 'new') loadChapter();
  }, [chapterId]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };


  useEffect(() => {
    if (chapterId !== 'new') loadChapter();
  }, [chapterId]);

  const loadChapter = async () => {
    const { data } = await supabase.functions.invoke('saga-manager', {
      body: { action: 'get_chapter_details', data: { chapterId } }
    });
    if (data) {
      setDialogues(data.dialogues || []);
      setObjectives(data.objectives || []);
      setRewards(data.rewards || []);
      setBranches(data.branches || []);
    }
  };

  const saveChapter = async () => {
    const action = chapterId === 'new' ? 'create_chapter' : 'update_chapter';
    const body = chapterId === 'new'
      ? { action, data: { chapter: { ...chapter, quest_id: questId } } }
      : { action, data: { chapterId, updates: chapter } };
    
    const { error } = await supabase.functions.invoke('saga-manager', { body });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Chapter saved!' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        <div className="flex gap-2">
          {currentUser && chapterId !== 'new' && (
            <CommentThread questId={questId} targetType="chapter" targetId={chapterId} currentUserId={currentUser.id} currentUserEmail={currentUser.email!} currentUserName={currentUser.user_metadata?.name} />
          )}
          <Button onClick={saveChapter}><Save className="mr-2 h-4 w-4" />Save Chapter</Button>
        </div>
      </div>


      <Card className="p-6 space-y-4">
        <CursorAwareInput
          fieldId={`chapter-title-${chapterId}`}
          value={chapter.title}
          onChange={(e) => setChapter({...chapter, title: e.target.value})}
          onCursorMove={broadcastCursor}
          cursors={cursors}
          placeholder="Chapter Title"
        />
        <CursorAwareInput
          fieldId={`chapter-description-${chapterId}`}
          value={chapter.description}
          onChange={(e) => setChapter({...chapter, description: e.target.value})}
          onCursorMove={broadcastCursor}
          cursors={cursors}
          multiline
          placeholder="Description"
        />
        <Input placeholder="Background Image URL" value={chapter.background_image_url} onChange={(e) => setChapter({...chapter, background_image_url: e.target.value})} />
      </Card>


      <Tabs defaultValue="dialogues">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dialogues">Dialogues</TabsTrigger>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
        </TabsList>
        <TabsContent value="dialogues">
          <DialogueEditor chapterId={chapterId} dialogues={dialogues} setDialogues={setDialogues} />
        </TabsContent>
        <TabsContent value="objectives">
          <ObjectiveEditor chapterId={chapterId} questId={questId} objectives={objectives} setObjectives={setObjectives} />
        </TabsContent>
        <TabsContent value="rewards">
          <RewardEditor chapterId={chapterId} questId={questId} rewards={rewards} setRewards={setRewards} />
        </TabsContent>
        <TabsContent value="branches">
          <BranchEditor chapterId={chapterId} branches={branches} setBranches={setBranches} />
        </TabsContent>
      </Tabs>
    </div>
  );
}