import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface CompleteLevelParams {
  levelId: string;
  stars: number;
  xpEarned: number;
  coinsEarned?: number;
  completionTime?: number;
  childId: string;
  parentId: string;
}

export interface CompleteLevelResult {
  success: boolean;
  data?: {
    levelId: string;
    stars: number;
    xpEarned: number;
    coinsEarned: number;
    newTotalXP: number;
    newLevel: number;
    newLessonsCompleted: number;
    isNewCompletion: boolean;
    improved: boolean;
  };
  error?: string;
}

export async function completeLevel(params: CompleteLevelParams): Promise<CompleteLevelResult> {
  try {
    const { data, error } = await supabase.functions.invoke('complete-level', {
      body: params
    });

    if (error) {
      console.error('Error completing level:', error);
      toast.error('Erreur lors de la sauvegarde de la progression');
      return { success: false, error: error.message };
    }

    if (data.success) {
      const result = data.data;
      
      // Show success toast with details
      if (result.isNewCompletion) {
        toast.success('Niveau terminé !', {
          description: `+${result.xpEarned} XP${result.coinsEarned > 0 ? ` et +${result.coinsEarned} pièces` : ''} • ${result.stars}/3 étoiles`
        });
      } else if (result.improved) {
        toast.success('Nouveau record !', {
          description: `${result.stars}/3 étoiles • +${result.xpEarned} XP bonus`
        });
      } else {
        toast.info('Niveau déjà terminé', {
          description: `Score précédent maintenu: ${result.stars}/3 étoiles`
        });
      }

      return { success: true, data: result };
    }

    return { success: false, error: 'Unknown error' };
  } catch (error: any) {
    console.error('Exception completing level:', error);
    toast.error('Erreur lors de la sauvegarde');
    return { success: false, error: error.message };
  }
}
