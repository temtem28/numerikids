import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Lock, Sparkles } from 'lucide-react';

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
  requiredTier: string;
  description?: string;
}

export function UpgradePrompt({ open, onOpenChange, featureName, requiredTier, description }: UpgradePromptProps) {
  const navigate = useNavigate();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <AlertDialogTitle className="text-2xl text-white">Fonctionnalité Premium</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-300 text-base space-y-3">
            <p className="font-semibold text-lg text-amber-400">{featureName}</p>
            <p>{description || `Cette fonctionnalité nécessite un abonnement ${requiredTier}.`}</p>
            <div className="flex items-center gap-2 text-cyan-400">
              <Sparkles className="w-5 h-5" />
              <span>Débloquez toutes les fonctionnalités premium !</span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600">Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => navigate('/billing')}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            Voir les plans
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
