import { supabase } from '@/lib/supabase';

export interface SagaQuestExport {
  quest: any;
  chapters: any[];
  dialogues: any[];
  objectives: any[];
  rewards: any[];
  branches: any[];
  exportedAt: string;
  version: string;
}

export interface BulkQuestExport {
  quests: SagaQuestExport[];
  exportedAt: string;
  version: string;
  totalQuests: number;
}

export const exportQuestToJSON = async (questId: string): Promise<SagaQuestExport | null> => {
  try {
    // Fetch quest data
    const { data: quest } = await supabase.functions.invoke('saga-manager', {
      body: { action: 'get_quest', data: { questId } }
    });

    // Fetch chapters
    const { data: chaptersData } = await supabase.functions.invoke('saga-manager', {
      body: { action: 'list_chapters', data: { questId } }
    });

    const chapters = chaptersData?.chapters || [];
    const dialogues: any[] = [];
    const objectives: any[] = [];
    const rewards: any[] = [];
    const branches: any[] = [];

    // Fetch related data for each chapter
    for (const chapter of chapters) {
      const [dialoguesRes, objectivesRes, rewardsRes, branchesRes] = await Promise.all([
        supabase.functions.invoke('saga-manager', {
          body: { action: 'list_dialogues', data: { chapterId: chapter.id } }
        }),
        supabase.functions.invoke('saga-manager', {
          body: { action: 'list_objectives', data: { chapterId: chapter.id } }
        }),
        supabase.functions.invoke('saga-manager', {
          body: { action: 'list_rewards', data: { chapterId: chapter.id } }
        }),
        supabase.functions.invoke('saga-manager', {
          body: { action: 'list_branches', data: { chapterId: chapter.id } }
        })
      ]);

      dialogues.push(...(dialoguesRes.data?.dialogues || []));
      objectives.push(...(objectivesRes.data?.objectives || []));
      rewards.push(...(rewardsRes.data?.rewards || []));
      branches.push(...(branchesRes.data?.branches || []));
    }

    return {
      quest: quest?.quest,
      chapters,
      dialogues,
      objectives,
      rewards,
      branches,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  } catch (error) {
    console.error('Export error:', error);
    return null;
  }
};

export const exportMultipleQuestsToJSON = async (questIds: string[]): Promise<BulkQuestExport | null> => {
  try {
    const quests: SagaQuestExport[] = [];
    
    for (const questId of questIds) {
      const questData = await exportQuestToJSON(questId);
      if (questData) {
        quests.push(questData);
      }
    }

    return {
      quests,
      exportedAt: new Date().toISOString(),
      version: '1.0',
      totalQuests: quests.length
    };
  } catch (error) {
    console.error('Bulk export error:', error);
    return null;
  }
};

export const downloadJSON = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const validateQuestStructure = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.version) errors.push('Missing version field');
  if (!data.quest) errors.push('Missing quest data');
  if (!Array.isArray(data.chapters)) errors.push('Chapters must be an array');
  if (!Array.isArray(data.dialogues)) errors.push('Dialogues must be an array');
  if (!Array.isArray(data.objectives)) errors.push('Objectives must be an array');
  if (!Array.isArray(data.rewards)) errors.push('Rewards must be an array');
  if (!Array.isArray(data.branches)) errors.push('Branches must be an array');

  if (data.quest) {
    if (!data.quest.title) errors.push('Quest title is required');
    if (!data.quest.difficulty_level) errors.push('Quest difficulty level is required');
  }

  return { valid: errors.length === 0, errors };
};

export const validateBulkQuestStructure = (data: any): { valid: boolean; errors: string[]; questCount: number } => {
  const errors: string[] = [];

  if (!data.version) errors.push('Missing version field');
  if (!data.quests || !Array.isArray(data.quests)) {
    errors.push('Quests must be an array');
    return { valid: false, errors, questCount: 0 };
  }

  data.quests.forEach((questData: any, index: number) => {
    const validation = validateQuestStructure(questData);
    if (!validation.valid) {
      errors.push(`Quest ${index + 1}: ${validation.errors.join(', ')}`);
    }
  });

  return { valid: errors.length === 0, errors, questCount: data.quests.length };
};
