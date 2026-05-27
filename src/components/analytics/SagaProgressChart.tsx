import { Card } from '@/components/ui/card';
import { BookOpen, CheckCircle } from 'lucide-react';

interface SagaProgress {
  sagaName: string;
  completed: number;
  total: number;
  color: string;
}

interface Props {
  sagaData: SagaProgress[];
}

export default function SagaProgressChart({ sagaData }: Props) {
  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold text-white">Progression par saga</h3>
      </div>

      <div className="space-y-5">
        {sagaData.map((saga, idx) => {
          const percentage = (saga.completed / saga.total) * 100;
          return (
            <div key={idx}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 font-medium">{saga.sagaName}</span>
                <span className="flex items-center gap-1 text-sm text-slate-400">
                  <CheckCircle className="w-4 h-4" />
                  {saga.completed}/{saga.total}
                </span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${saga.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">{percentage.toFixed(0)}% complété</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
