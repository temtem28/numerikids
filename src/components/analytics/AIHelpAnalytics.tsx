import { Card } from '@/components/ui/card';
import { HelpCircle, AlertCircle } from 'lucide-react';

interface HelpTopic {
  topic: string;
  count: number;
  percentage: number;
}

interface Props {
  helpTopics: HelpTopic[];
}

export default function AIHelpAnalytics({ helpTopics }: Props) {
  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-orange-500/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="w-6 h-6 text-orange-400" />
        <h3 className="text-xl font-bold text-white">Zones d'aide IA</h3>
      </div>

      {helpTopics.length === 0 ? (
        <p className="text-slate-400 text-center py-4">Aucune demande d'aide pour le moment</p>
      ) : (
        <div className="space-y-3">
          {helpTopics.map((topic, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-slate-200 font-medium">{topic.topic}</span>
                  <span className="text-xs text-slate-400">{topic.count}x</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                    style={{ width: `${topic.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
