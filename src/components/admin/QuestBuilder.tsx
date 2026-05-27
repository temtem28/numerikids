import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ChapterEditor } from './ChapterEditor';
import { FlowchartView } from './FlowchartView';
import VersionHistoryModal from './VersionHistoryModal';
import VersionCompareModal from './VersionCompareModal';
import { CollaborationPresence } from './CollaborationPresence';
import { ActivityFeed } from './ActivityFeed';
import { ConflictResolutionModal } from './ConflictResolutionModal';
import { CursorAwareInput } from './CursorAwareInput';
import { ArrowLeft, Plus, Save, List, Network, GitBranch, CheckCircle, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useCursorTracking } from '@/hooks/useCursorTracking';





interface Quest {
  id?: string;
  title: string;
  description: string;
  story_arc: string;
  difficulty_level: string;
  estimated_duration: number;
  thumbnail_url: string;
  is_published: boolean;
  order_index: number;
}

interface QuestBuilderProps {
  questId?: string;
  onBack: () => void;
}

export function QuestBuilder({ questId, onBack }: QuestBuilderProps) {
  const [quest, setQuest] = useState<Quest>({
    title: '',
    description: '',
    story_arc: '',
    difficulty_level: 'beginner',
    estimated_duration: 30,
    thumbnail_url: '',
    is_published: false,
    order_index: 0
  });
  const [chapters, setChapters] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'flowchart'>('list');
  const [loading, setLoading] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showVersionCompare, setShowVersionCompare] = useState(false);
  const [showSaveVersionDialog, setShowSaveVersionDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [currentVersion, setCurrentVersion] = useState<any>(null);
  const [compareVersion, setCompareVersion] = useState<any>(null);
  const [incomingVersion, setIncomingVersion] = useState<any>(null);
  const [changeDescription, setChangeDescription] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questLoadedAt, setQuestLoadedAt] = useState<string>(new Date().toISOString());
  const { toast } = useToast();
  
  // Get current user for cursor tracking
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);
  
  const { cursors, broadcastCursor } = useCursorTracking(
    questId || '',
    sessionId || '',
    currentUser?.id || '',
    currentUser?.user_metadata?.name || currentUser?.email || 'Anonymous',
    currentUser?.email || ''
  );


  useEffect(() => {
    if (questId) {
      loadQuest();
      startCollaborationSession();
    }
    return () => {
      if (sessionId) endCollaborationSession();
    };
  }, [questId]);

  const startCollaborationSession = async () => {
    if (!questId) return;
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await supabase.functions.invoke('saga-collaboration', {
      body: {
        action: 'startSession',
        questId,
        userId: user.id,
        userEmail: user.email,
        userName: user.user_metadata?.name,
        sessionData: { editingSection: 'quest-details' }
      }
    });
    if (data?.success) {
      setSessionId(data.data.id);
      const interval = setInterval(() => updateSession(data.data.id), 30000);
      return () => clearInterval(interval);
    }
  };

  const updateSession = async (sid: string) => {
    await supabase.functions.invoke('saga-collaboration', {
      body: { action: 'updateSession', sessionData: { sessionId: sid } }
    });
  };

  const endCollaborationSession = async () => {
    if (!sessionId) return;
    await supabase.functions.invoke('saga-collaboration', {
      body: { action: 'endSession', sessionData: { sessionId } }
    });
  };

  useEffect(() => {
    if (questId) loadQuest();
  }, [questId]);

  const loadQuest = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('saga-manager', {
      body: { action: 'get_quest', data: { questId } }
    });
    if (!error && data) {
      setQuest(data.quest);
      setChapters(data.chapters || []);
      setQuestLoadedAt(new Date().toISOString());
      await loadBranches();
    }
    setLoading(false);
  };


  const loadBranches = async () => {
    // Load all branches from all chapters
    const allBranches: any[] = [];
    for (const chapter of chapters) {
      const { data } = await supabase.functions.invoke('saga-manager', {
        body: { action: 'get_chapter_details', data: { chapterId: chapter.id } }
      });
      if (data?.branches) {
        allBranches.push(...data.branches);
      }
    }
    setBranches(allBranches);
  };



  const saveQuest = async () => {
    setLoading(true);
    
    // Check for conflicts before saving
    if (questId) {
      const { data: conflictData } = await supabase.functions.invoke('saga-collaboration', {
        body: {
          action: 'detectConflict',
          questId,
          conflictData: { lastLoadedAt: questLoadedAt }
        }
      });
      
      if (conflictData?.data?.hasConflict) {
        setIncomingVersion(conflictData.data.latestVersion);
        setCurrentVersion(quest);
        setShowConflictModal(true);
        setLoading(false);
        return;
      }
    }
    
    const action = questId ? 'update_quest' : 'create_quest';
    const body = questId 
      ? { action, data: { questId, updates: quest } }
      : { action, data: { quest } };
    
    const { data, error } = await supabase.functions.invoke('saga-manager', { body });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Quest saved!' });
      if (!questId && data.quest) {
        setQuest(data.quest);
      }
      if (questId) {
        setShowSaveVersionDialog(true);
      }
    }
    setLoading(false);
  };


  const createVersion = async () => {
    if (!questId) return;
    const { error } = await supabase.functions.invoke('saga-version-control', {
      body: { action: 'createVersion', questId, changeDescription }
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Version created!' });
      setChangeDescription('');
      setShowSaveVersionDialog(false);
      loadVersionHistory();
    }
  };

  const loadVersionHistory = async () => {
    if (!questId) return;
    const { data } = await supabase.functions.invoke('saga-version-control', {
      body: { action: 'getHistory', questId }
    });
    if (data?.versions) {
      setVersions(data.versions);
    }
  };

  const publishVersion = async (versionId: string) => {
    const { error } = await supabase.functions.invoke('saga-version-control', {
      body: { action: 'publish', questId, versionId }
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Version published!' });
      loadVersionHistory();
    }
  };

  const rollbackVersion = async (versionId: string) => {
    if (!confirm('Rollback to this version? Current changes will be replaced.')) return;
    const { error } = await supabase.functions.invoke('saga-version-control', {
      body: { action: 'rollback', questId, versionId }
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Rolled back to version!' });
      loadQuest();
      loadVersionHistory();
    }
  };

  const viewVersion = async (versionId: string) => {
    const { data } = await supabase.functions.invoke('saga-version-control', {
      body: { action: 'getVersion', versionId }
    });
    if (data) {
      setCurrentVersion(data);
      setShowVersionCompare(true);
    }
  };

  const handleAcceptCurrent = async () => {
    setShowConflictModal(false);
    // Continue with save using current version
    const action = 'update_quest';
    const body = { action, data: { questId, updates: quest } };
    const { error } = await supabase.functions.invoke('saga-manager', { body });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Your version saved!' });
      setShowSaveVersionDialog(true);
    }
  };

  const handleAcceptIncoming = async () => {
    setShowConflictModal(false);
    // Load the incoming version
    await loadQuest();
    toast({ title: 'Loaded', description: 'Incoming version loaded. Please review and save.' });
  };

  const handleManualMerge = async (mergedData: any) => {
    setShowConflictModal(false);
    // Apply merged data to quest
    setQuest(mergedData);
    
    // Save the merged version
    const action = 'update_quest';
    const body = { action, data: { questId, updates: mergedData } };
    const { error } = await supabase.functions.invoke('saga-manager', { body });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Merged version saved!' });
      setShowSaveVersionDialog(true);
    }
  };




  if (selectedChapter) {
    return <ChapterEditor chapterId={selectedChapter} questId={quest.id!} onBack={() => setSelectedChapter(null)} />;
  }

  return (
    <div className="flex flex-col h-screen">
      {questId && <CollaborationPresence questId={questId} currentUserId={(supabase.auth.getUser() as any).data?.user?.id || ''} />}
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
            <div className="flex gap-2">
              {questId && (
                <>
                  <Button variant="outline" onClick={() => setShowActivityFeed(!showActivityFeed)}>
                    <Users className="mr-2 h-4 w-4" />Activity
                  </Button>
                  <Button variant="outline" onClick={() => { loadVersionHistory(); setShowVersionHistory(true); }}>
                    <GitBranch className="mr-2 h-4 w-4" />Version History
                  </Button>
                </>
              )}
              <Button onClick={saveQuest} disabled={loading}><Save className="mr-2 h-4 w-4" />Save Quest</Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <Card className="p-6 space-y-4">
                <div>

                  <Label>Quest Title</Label>
                  <CursorAwareInput
                    fieldId="quest-title"
                    value={quest.title}
                    onChange={(e) => setQuest({...quest, title: e.target.value})}
                    onCursorMove={broadcastCursor}
                    cursors={cursors}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <CursorAwareInput
                    fieldId="quest-description"
                    value={quest.description}
                    onChange={(e) => setQuest({...quest, description: e.target.value})}
                    onCursorMove={broadcastCursor}
                    cursors={cursors}
                    multiline
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Story Arc</Label>
                  <CursorAwareInput
                    fieldId="quest-story-arc"
                    value={quest.story_arc}
                    onChange={(e) => setQuest({...quest, story_arc: e.target.value})}
                    onCursorMove={broadcastCursor}
                    cursors={cursors}
                    multiline
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Difficulty</Label><Select value={quest.difficulty_level} onValueChange={(v) => setQuest({...quest, difficulty_level: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent></Select></div>
                  <div><Label>Duration (minutes)</Label><Input type="number" value={quest.estimated_duration} onChange={(e) => setQuest({...quest, estimated_duration: parseInt(e.target.value)})} /></div>
                </div>
                <div className="flex items-center space-x-2"><Switch checked={quest.is_published} onCheckedChange={(v) => setQuest({...quest, is_published: v})} /><Label>Published</Label></div>
              </Card>

              {quest.id && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Chapters</h3>
                    <div className="flex gap-2">
                      <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}><List className="mr-2 h-4 w-4" />List View</Button>
                      <Button variant={viewMode === 'flowchart' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('flowchart')}><Network className="mr-2 h-4 w-4" />Flowchart</Button>
                      <Button onClick={() => setSelectedChapter('new')}><Plus className="mr-2 h-4 w-4" />Add Chapter</Button>
                    </div>
                  </div>
                  {viewMode === 'list' ? (
                    <div className="space-y-2">{chapters.map((ch) => (<Card key={ch.id} className="p-4 cursor-pointer hover:bg-accent" onClick={() => setSelectedChapter(ch.id)}><h4 className="font-medium">{ch.title}</h4><p className="text-sm text-muted-foreground">{ch.description}</p></Card>))}</div>
                  ) : (<FlowchartView chapters={chapters} branches={branches} onChapterClick={(chapterId) => setSelectedChapter(chapterId)} />)}
                </div>
              )}
            </div>

            {showActivityFeed && questId && (
              <div className="col-span-1">
                <ActivityFeed questId={questId} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showSaveVersionDialog} onOpenChange={setShowSaveVersionDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Version</DialogTitle></DialogHeader>
          <div className="space-y-4"><Label>Change Description</Label><Textarea value={changeDescription} onChange={(e) => setChangeDescription(e.target.value)} placeholder="Describe what changed in this version..." rows={3} /></div>
          <DialogFooter><Button variant="outline" onClick={() => setShowSaveVersionDialog(false)}>Skip</Button><Button onClick={createVersion}>Create Version</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <VersionHistoryModal open={showVersionHistory} onClose={() => setShowVersionHistory(false)} versions={versions} onPublish={publishVersion} onRollback={rollbackVersion} onCompare={() => {}} onViewVersion={viewVersion} />
      <VersionCompareModal open={showVersionCompare} onClose={() => setShowVersionCompare(false)} currentVersion={currentVersion} compareVersion={compareVersion} />
      
      <ConflictResolutionModal
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        currentVersion={currentVersion}
        incomingVersion={incomingVersion}
        onAcceptCurrent={handleAcceptCurrent}
        onAcceptIncoming={handleAcceptIncoming}
        onManualMerge={handleManualMerge}
      />
    </div>
  );
}
