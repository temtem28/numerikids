import { Card } from '@/components/ui/card';
import { Clock, Code, Blocks, Brain } from 'lucide-react';

interface ExerciseTime {
  type: string;
  minutes: number;
  icon: any;
  color: string;
}

interface Props {
  exerciseData: ExerciseTime[];
}

export default function ExerciseTimeChart({ exerciseData }: Props) {
  const totalMinutes = exerciseData.reduce((sum, ex) => sum + ex.minutes, 0);

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-pink-500/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-6 h-6 text-pink-400" />
        <h3 className="text-xl font-bold text-white">Temps par type d'exercice</h3>
      </div>

      <div className="space-y-4">
        {exerciseData.map((exercise, idx) => {
          const percentage = (exercise.minutes / totalMinutes) * 100;
          const Icon = exercise.icon;
          return (
            <div key={idx} className="flex items-center gap-4">
              <Icon className={`w-5 h-5 ${exercise.color}`} />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">{exercise.type}</span>
                  <span className="text-sm text-slate-400">{exercise.minutes} min</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${exercise.color.replace('text-', 'bg-')} transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
