import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { AlertCircle, TrendingUp, Users, Cpu, HardDrive, Infinity } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface UsageLimit {
  name: string;
  current: number;
  limit: number;
  unit: string;
}

interface UsageLimitsProps {
  limits: UsageLimit[];
  planName: string;
}

export function UsageLimits({ limits, planName }: UsageLimitsProps) {
  const navigate = useNavigate();

  const getIcon = (name: string) => {
    if (name.toLowerCase().includes('enfant') || name.toLowerCase().includes('profil')) {
      return <Users className="w-5 h-5 text-cyan-400" />;
    }
    if (name.toLowerCase().includes('ia') || name.toLowerCase().includes('ai')) {
      return <Cpu className="w-5 h-5 text-purple-400" />;
    }
    if (name.toLowerCase().includes('stockage') || name.toLowerCase().includes('storage')) {
      return <HardDrive className="w-5 h-5 text-green-400" />;
    }
    return <TrendingUp className="w-5 h-5 text-slate-400" />;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-cyan-500';
  };

  return (
    <Card className="p-6 bg-slate-900/50 border-cyan-500/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Utilisation & Limites</h3>
          <p className="text-sm text-slate-400 mt-1">
            Plan actuel : <span className="font-medium text-cyan-400">{planName}</span>
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        {limits.map((limit, idx) => {
          const isUnlimited = limit.limit === -1;
          const percentage = isUnlimited ? 0 : Math.min((limit.current / limit.limit) * 100, 100);
          const isNearLimit = percentage >= 80 && !isUnlimited;
          const isAtLimit = percentage >= 100 && !isUnlimited;

          return (
            <div key={idx} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getIcon(limit.name)}
                  <span className="font-medium text-white">{limit.name}</span>
                </div>
                <span className="text-sm text-slate-400">
                  {isUnlimited ? (
                    <span className="flex items-center gap-1 text-green-400">
                      <Infinity className="w-4 h-4" />
                      Illimité
                    </span>
                  ) : (
                    <span className={isAtLimit ? 'text-red-400' : ''}>
                      {limit.current} / {limit.limit} {limit.unit}
                    </span>
                  )}
                </span>
              </div>
              
              {!isUnlimited && (
                <>
                  <div className="relative">
                    <Progress 
                      value={percentage} 
                      className="h-2 bg-slate-700"
                    />
                    <div 
                      className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(percentage)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  {isAtLimit && (
                    <Alert className="mt-3 bg-red-500/10 border-red-500/30">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-xs text-red-200">
                        Vous avez atteint votre limite. Passez à un plan supérieur pour continuer.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {isNearLimit && !isAtLimit && (
                    <Alert className="mt-3 bg-amber-500/10 border-amber-500/30">
                      <AlertCircle className="h-4 w-4 text-amber-400" />
                      <AlertDescription className="text-xs text-amber-200">
                        Vous approchez de votre limite. Pensez à passer à un plan supérieur.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Upgrade prompt */}
      {limits.some(l => l.limit !== -1 && (l.current / l.limit) >= 0.7) && (
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
          <p className="text-sm text-slate-300 mb-3">
            Besoin de plus de ressources ? Passez à un plan supérieur pour débloquer des limites plus élevées.
          </p>
          <Button 
            onClick={() => navigate('/billing')}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            size="sm"
          >
            Voir les plans
          </Button>
        </div>
      )}
    </Card>
  );
}
