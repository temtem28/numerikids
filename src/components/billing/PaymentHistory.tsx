import { Download, ExternalLink, Receipt, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  invoice_url?: string;
  invoice_pdf?: string;
  paid_at?: string;
  created_at: string;
}

interface PaymentHistoryProps {
  payments: Payment[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return { 
          color: 'bg-green-500/20 text-green-400 border-green-500/30', 
          icon: CheckCircle,
          label: 'Payé'
        };
      case 'pending':
        return { 
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', 
          icon: Clock,
          label: 'En attente'
        };
      case 'failed':
        return { 
          color: 'bg-red-500/20 text-red-400 border-red-500/30', 
          icon: XCircle,
          label: 'Échoué'
        };
      case 'refunded':
        return { 
          color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', 
          icon: Receipt,
          label: 'Remboursé'
        };
      default:
        return { 
          color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', 
          icon: Receipt,
          label: status
        };
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR'
    });
    return formatter.format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="p-6 bg-slate-900/50 border-cyan-500/20">
      <div className="flex items-center gap-2 mb-6">
        <Receipt className="w-5 h-5 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">Historique des Paiements</h3>
      </div>
      
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">Aucun historique de paiement</p>
          <p className="text-slate-500 text-sm">Vos paiements apparaîtront ici une fois que vous aurez souscrit à un abonnement.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const statusConfig = getStatusConfig(payment.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div 
                key={payment.id} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold text-white">
                      {formatCurrency(payment.amount, payment.currency)}
                    </span>
                    <Badge className={`${statusConfig.color} flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  {payment.description && (
                    <p className="text-sm text-slate-400 mb-1">{payment.description}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    {formatDate(payment.paid_at || payment.created_at)}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {payment.invoice_url && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                      asChild
                    >
                      <a href={payment.invoice_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Voir
                      </a>
                    </Button>
                  )}
                  {payment.invoice_pdf && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                      asChild
                    >
                      <a href={payment.invoice_pdf} download>
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
