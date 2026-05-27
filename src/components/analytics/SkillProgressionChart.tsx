import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface SkillData {
  skill: string;
  current: number;
  benchmark: number;
  color: string;
}

interface Props {
  skills: SkillData[];
}

export default function SkillProgressionChart({ skills }: Props) {
  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-cyan-500/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">Progression des compétences</h3>
      </div>

      <div className="space-y-4">
        {skills.map((skill, idx) => (
          <div key={idx}>
            <div className="flex justify-between mb-2">
              <span className="text-slate-300 font-medium">{skill.skill}</span>
              <span className="text-sm text-slate-400">
                {skill.current}% vs {skill.benchmark}% (moyenne)
              </span>
            </div>
            <div className="relative h-8 bg-slate-800 rounded-lg overflow-hidden">
              <div
                className={`h-full ${skill.color} transition-all duration-500`}
                style={{ width: `${skill.current}%` }}
              />
              <div
                className="absolute top-0 h-full w-1 bg-yellow-400"
                style={{ left: `${skill.benchmark}%` }}
                title="Moyenne d'âge"
              />
            </div>
            {skill.current > skill.benchmark && (
              <p className="text-xs text-green-400 mt-1">
                +{skill.current - skill.benchmark}% au-dessus de la moyenne
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
