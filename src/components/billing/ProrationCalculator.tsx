import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, CreditCard, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface ProrationCalculatorProps {
  currentPlanId: string;
  currentPlanName: string;
  currentPlanPrice: number;
  newPlanId: string;
  newPlanName: string;
  newPlanPrice: number;
  billingCycle: 'monthly' | 'yearly';
  currentPeriodEnd: Date;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProrationCalculator({
  currentPlanId,
  currentPlanName,
  currentPlanPrice,
  newPlanId,
  newPlanName,
  newPlanPrice,
  billingCycle,
  currentPeriodEnd,
  onConfirm,
  onCancel,
  isLoading = false
}: ProrationCalculatorProps) {
  const [proration, setProration] = useState({
    remainingDays: 0,
    totalDays: 0,
    currentPlanCredit: 0,
    newPlanCharge: 0,
    netAmount: 0,
    nextBillingAmount: 0,
    nextBillingDate: new Date()
  });

  useEffect(() => {
    calculateProration();
  }, [currentPlanPrice, newPlanPrice, currentPeriodEnd, billingCycle]);

  const calculateProration = () => {
    const now = new Date();
    const periodEnd = new Date(currentPeriodEnd);
    const remainingMs = periodEnd.getTime() - now.getTime();
    const remainingDays = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
    
    const totalDays = billingCycle === 'monthly' ? 30 : 365;
    const unusedRatio = remainingDays / totalDays;
    
    const currentPlanCredit = currentPlanPrice * unusedRatio;
    const newPlanCharge = newPlanPrice * unusedRatio;
    const netAmount = newPlanCharge - currentPlanCredit;

    setProration({
      remainingDays,
      totalDays,
      currentPlanCredit,
      newPlanCharge,
      netAmount,
      nextBillingAmount: newPlanPrice,
      nextBillingDate: periodEnd
    });
  };

  const isUpgrade = newPlanPrice > currentPlanPrice;
  const billingLabel = billingCycle === 'monthly' ? 'mois' : 'an';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Card className="p-6 space-y-6 bg-slate-900 border-cyan-500/30">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-white">Résumé du changement de plan</h3>
        <p className="text-slate-400">Vérifiez les détails avant de confirmer</p>
      </div>

      {/* Plan comparison */}
      <div className="flex items-center justify-center gap-4">
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center flex-1">
          <p className="text-xs text-slate-500 mb-1">Plan actuel</p>
          <p className="text-lg font-bold text-white">{currentPlanName}</p>
          <p className="text-cyan-400">{currentPlanPrice}€/{billingLabel}</p>
        </div>
        <ArrowRight className="w-6 h-6 text-cyan-400 flex-shrink-0" />
        <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg border-2 border-cyan-500/50 text-center flex-1">
          <p className="text-xs text-slate-400 mb-1">Nouveau plan</p>
          <p className="text-lg font-bold text-white">{newPlanName}</p>
          <p className="text-cyan-300">{newPlanPrice}€/{billingLabel}</p>
        </div>
      </div>

      {/* Billing period details */}
      <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
        <h4 className="font-semibold flex items-center gap-2 text-white">
          <Calendar className="w-4 h-4 text-cyan-400" />
          Détails de la période de facturation
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Jours restants dans la période :</span>
            <span className="font-semibold text-white">{proration.remainingDays} sur {proration.totalDays} jours</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Fin de la période actuelle :</span>
            <span className="font-semibold text-white">{formatDate(proration.nextBillingDate)}</span>
          </div>
        </div>
      </div>

      {/* Proration breakdown */}
      <div className="space-y-3">
        <h4 className="font-semibold flex items-center gap-2 text-white">
          <CreditCard className="w-4 h-4 text-purple-400" />
          Détail du prorata
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <span className="text-sm text-green-300">Crédit pour {currentPlanName}</span>
            <span className="font-semibold text-green-400">
              -{proration.currentPlanCredit.toFixed(2)}€
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <span className="text-sm text-blue-300">Charge proratisée pour {newPlanName}</span>
            <span className="font-semibold text-blue-400">
              +{proration.newPlanCharge.toFixed(2)}€
            </span>
          </div>
          <div className="h-px bg-slate-700" />
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30">
            <span className="font-semibold text-white">Montant dû aujourd'hui :</span>
            <span className="text-2xl font-bold text-white">
              {proration.netAmount >= 0 ? '' : 'Crédit: '}
              {proration.netAmount >= 0 ? '+' : ''}{Math.abs(proration.netAmount).toFixed(2)}€
            </span>
          </div>
        </div>
      </div>

      {/* Next billing cycle */}
      <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          {isUpgrade ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-orange-400" />
          )}
          Prochain cycle de facturation
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Prochaine date de facturation :</span>
          <span className="font-semibold text-white">{formatDate(proration.nextBillingDate)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Montant de la prochaine facture :</span>
          <span className="font-semibold text-white">{proration.nextBillingAmount.toFixed(2)}€</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          disabled={isLoading} 
          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          Annuler
        </Button>
        <Button 
          onClick={onConfirm} 
          disabled={isLoading} 
          className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Traitement...
            </>
          ) : (
            `Confirmer ${isUpgrade ? 'la mise à niveau' : 'le changement'}`
          )}
        </Button>
      </div>
    </Card>
  );
}
