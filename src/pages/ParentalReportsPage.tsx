import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3, Calendar, Clock, Download, FileText, Loader2, Mail,
  RefreshCw, TrendingUp, Trophy, Users, Zap, Target, Brain,
  CheckCircle, AlertTriangle, Star, Flame, BookOpen, Award
} from 'lucide-react';
import { format, subDays, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import ChildReportCard from '@/components/reports/ChildReportCard';
import ReportTimeChart from '@/components/reports/ReportTimeChart';
import ReportScoresChart from '@/components/reports/ReportScoresChart';
import ReportStrengthsPanel from '@/components/reports/ReportStrengthsPanel';
import EmailReportSettings from '@/components/reports/EmailReportSettings';

interface Child {
  id: string;
  name: string;
  age?: number;
  avatar_url?: string;
  xp_points: number;
}

interface ChildReport {
  childId: string;
  childName: string;
  childAge?: number;
  avatarUrl?: string;
  currentXP: number;
  currentCoins: number;
  currentStreak: number;
  longestStreak: number;
  periodStats: {
    totalTimeMinutes: number;
    dailyTimeBreakdown: Record<string, number>;
    averageTimePerDay: number;
    lessonsCompleted: number;
    quizzesTaken: number;
    avgQuizScore: number;
    xpEarned: number;
    achievementsEarned: number;
  };
  performance: {
    strengths: { subject: string; avgScore: number }[];
    struggles: { subject: string; avgScore: number }[];
    overallProgress: 'excellent' | 'good' | 'needs_improvement' | 'no_data';
  };
  recommendations: string[];
}

interface ReportData {
  reportId: string;
  generatedAt: string;
  reportType: 'weekly' | 'monthly' | 'custom';
  periodStart: string;
  periodEnd: string;
  children: ChildReport[];
  summary: {
    totalChildren: number;
    totalTimeMinutes: number;
    totalLessonsCompleted: number;
    totalXPEarned: number;
    averageQuizScore: number;
  };
}

type ReportPeriod = 'weekly' | 'monthly' | 'custom';

export default function ParentalReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('weekly');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportHistory, setReportHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadChildren();
      loadReportHistory();
    }
  }, [user]);

  useEffect(() => {
    if (children.length > 0) {
      generateReport();
    }
  }, [selectedChildId, reportPeriod, children]);

  const loadChildren = async () => {
    const { data } = await supabase
      .from('children')
      .select('id, name, age, avatar_url, xp_points')
      .eq('parent_id', user?.id);
    
    if (data && data.length > 0) {
      setChildren(data);
    }
    setLoading(false);
  };

  const loadReportHistory = async () => {
    const { data } = await supabase
      .from('generated_reports')
      .select('*')
      .eq('parent_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setReportHistory(data);
    }
  };

  const generateReport = async () => {
    if (children.length === 0) return;
    
    setGenerating(true);
    
    try {
      const now = new Date();
      let periodStart: Date;
      let periodEnd: Date = now;

      if (reportPeriod === 'weekly') {
        periodStart = subDays(now, 7);
      } else if (reportPeriod === 'monthly') {
        periodStart = subMonths(now, 1);
      } else {
        periodStart = subDays(now, 30);
      }

      const startStr = format(periodStart, 'yyyy-MM-dd');
      const endStr = format(periodEnd, 'yyyy-MM-dd');

      const childIds = selectedChildId === 'all' 
        ? children.map(c => c.id) 
        : [selectedChildId];

      // Fetch all data
      const [sessionsRes, levelsRes, progressRes, achievementsRes, streaksRes, coinsRes] = await Promise.all([
        supabase.from('learning_sessions').select('*').in('child_id', childIds).gte('started_at', startStr).lte('started_at', endStr + 'T23:59:59'),
        supabase.from('level_completions').select('*').in('child_id', childIds).gte('completed_at', startStr).lte('completed_at', endStr + 'T23:59:59'),
        supabase.from('user_progress').select('*').in('user_id', childIds),
        supabase.from('user_achievements').select('*, achievements(*)').in('user_id', childIds).gte('earned_at', startStr).lte('earned_at', endStr + 'T23:59:59'),
        supabase.from('streaks').select('*').in('user_id', childIds),
        supabase.from('child_coins').select('*').in('child_id', childIds)
      ]);

      const sessions = sessionsRes.data || [];
      const levels = levelsRes.data || [];
      const progress = progressRes.data || [];
      const achievements = achievementsRes.data || [];
      const streaks = streaksRes.data || [];
      const coins = coinsRes.data || [];

      // Process data for each child
      const childReports: ChildReport[] = children
        .filter(c => selectedChildId === 'all' || c.id === selectedChildId)
        .map(child => {
          const childSessions = sessions.filter(s => s.child_id === child.id);
          const childLevels = levels.filter(l => l.child_id === child.id);
          const childProgress = progress.filter(p => p.user_id === child.id);
          const childAchievements = achievements.filter(a => a.user_id === child.id);
          const childStreak = streaks.find(s => s.user_id === child.id);
          const childCoins = coins.find(c => c.child_id === child.id);

          // Calculate time spent
          const totalTimeMinutes = childSessions.reduce((sum, s) => 
            sum + (s.duration_seconds ? Math.round(s.duration_seconds / 60) : 0), 0);

          // Daily breakdown
          const dailyTime: Record<string, number> = {};
          childSessions.forEach(s => {
            const date = s.started_at?.split('T')[0];
            if (date) {
              dailyTime[date] = (dailyTime[date] || 0) + Math.round((s.duration_seconds || 0) / 60);
            }
          });

          // Quiz scores
          const quizScores = childProgress
            .filter(p => p.score !== null && p.score !== undefined)
            .map(p => p.score);
          const avgQuizScore = quizScores.length > 0 
            ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
            : 0;

          // XP earned
          const xpEarned = childSessions.reduce((sum, s) => sum + (s.xp_earned || 0), 0) +
                          childLevels.reduce((sum, l) => sum + (l.xp_earned || 0), 0);

          // Strengths and struggles
          const subjectScores: Record<string, { total: number; count: number }> = {};
          childProgress.forEach(p => {
            const subject = p.lesson_type || p.module_id || 'Général';
            if (!subjectScores[subject]) {
              subjectScores[subject] = { total: 0, count: 0 };
            }
            if (p.score !== null && p.score !== undefined) {
              subjectScores[subject].total += p.score;
              subjectScores[subject].count += 1;
            }
          });

          const subjectAverages = Object.entries(subjectScores)
            .map(([subject, data]) => ({
              subject: formatSubjectName(subject),
              avgScore: data.count > 0 ? Math.round(data.total / data.count) : 0
            }))
            .sort((a, b) => b.avgScore - a.avgScore);

          const strengths = subjectAverages.filter(s => s.avgScore >= 75).slice(0, 3);
          const struggles = subjectAverages.filter(s => s.avgScore < 60).slice(0, 3);

          // Recommendations
          const recommendations: string[] = [];
          if (totalTimeMinutes < 60) {
            recommendations.push("Encouragez plus de temps d'apprentissage quotidien - visez 15-20 minutes par jour.");
          }
          if (avgQuizScore > 0 && avgQuizScore < 70) {
            recommendations.push("Les scores aux quiz peuvent être améliorés. Révisez les leçons avant les quiz.");
          }
          if (childLevels.length < 3) {
            recommendations.push("Essayez de compléter au moins 3-5 leçons par semaine pour maintenir la progression.");
          }
          if (struggles.length > 0) {
            recommendations.push(`Focus recommandé sur: ${struggles.map(s => s.subject).join(', ')}`);
          }
          if ((childStreak?.current_streak || 0) >= 5) {
            recommendations.push("Excellente série! Continuez à maintenir cette régularité.");
          }
          if (recommendations.length === 0) {
            recommendations.push("Continuez ainsi! La progression est excellente.");
          }

          return {
            childId: child.id,
            childName: child.name,
            childAge: child.age,
            avatarUrl: child.avatar_url,
            currentXP: child.xp_points || 0,
            currentCoins: childCoins?.balance || 0,
            currentStreak: childStreak?.current_streak || 0,
            longestStreak: childStreak?.longest_streak || 0,
            periodStats: {
              totalTimeMinutes,
              dailyTimeBreakdown: dailyTime,
              averageTimePerDay: Object.keys(dailyTime).length > 0 
                ? Math.round(totalTimeMinutes / Object.keys(dailyTime).length) 
                : 0,
              lessonsCompleted: childLevels.length,
              quizzesTaken: quizScores.length,
              avgQuizScore,
              xpEarned,
              achievementsEarned: childAchievements.length
            },
            performance: {
              strengths,
              struggles,
              overallProgress: avgQuizScore >= 80 ? 'excellent' : avgQuizScore >= 60 ? 'good' : avgQuizScore > 0 ? 'needs_improvement' : 'no_data'
            },
            recommendations
          };
        });

      const report: ReportData = {
        reportId: crypto.randomUUID(),
        generatedAt: new Date().toISOString(),
        reportType: reportPeriod,
        periodStart: startStr,
        periodEnd: endStr,
        children: childReports,
        summary: {
          totalChildren: childReports.length,
          totalTimeMinutes: childReports.reduce((sum, c) => sum + c.periodStats.totalTimeMinutes, 0),
          totalLessonsCompleted: childReports.reduce((sum, c) => sum + c.periodStats.lessonsCompleted, 0),
          totalXPEarned: childReports.reduce((sum, c) => sum + c.periodStats.xpEarned, 0),
          averageQuizScore: childReports.length > 0
            ? Math.round(childReports.reduce((sum, c) => sum + c.periodStats.avgQuizScore, 0) / childReports.length)
            : 0
        }
      };

      setReportData(report);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le rapport',
        variant: 'destructive'
      });
    }
    
    setGenerating(false);
  };

  const formatSubjectName = (subject: string): string => {
    const names: Record<string, string> = {
      'python': 'Python',
      'scratch': 'Scratch',
      'quiz': 'Quiz',
      'video': 'Vidéos',
      'pixel-kingdom': 'Pixel Kingdom',
      'saga': 'Sagas',
      'general': 'Général'
    };
    return names[subject.toLowerCase()] || subject;
  };

  const exportToPDF = async () => {
    if (!reportData) return;
    
    setExporting(true);
    
    try {
      // Generate PDF content
      const pdfContent = generatePDFContent(reportData);
      
      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Open in new window for printing
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      
      toast({
        title: 'Rapport prêt',
        description: 'Le rapport s\'ouvre dans une nouvelle fenêtre pour impression/PDF'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter le rapport',
        variant: 'destructive'
      });
    }
    
    setExporting(false);
  };

  const generatePDFContent = (data: ReportData): string => {
    const periodLabel = data.reportType === 'weekly' ? 'Hebdomadaire' : 'Mensuel';
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport ${periodLabel} NumériKids</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1e293b; }
    h1 { color: #0891b2; border-bottom: 3px solid #0891b2; padding-bottom: 10px; }
    h2 { color: #7c3aed; margin-top: 30px; }
    h3 { color: #334155; }
    .header { text-align: center; margin-bottom: 40px; }
    .period { color: #64748b; font-size: 14px; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
    .summary-card { background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; }
    .summary-value { font-size: 24px; font-weight: bold; color: #0891b2; }
    .summary-label { font-size: 12px; color: #64748b; }
    .child-section { margin: 30px 0; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; }
    .child-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
    .avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #06b6d4, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: bold; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 15px 0; }
    .stat-item { background: #f8fafc; padding: 10px; border-radius: 6px; }
    .stat-value { font-size: 18px; font-weight: bold; }
    .stat-label { font-size: 11px; color: #64748b; }
    .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin: 5px 0; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #06b6d4, #8b5cf6); }
    .strength { color: #10b981; }
    .struggle { color: #f59e0b; }
    .recommendation { background: #fef3c7; padding: 10px; border-radius: 6px; margin: 5px 0; font-size: 13px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Rapport ${periodLabel} NumériKids</h1>
    <p class="period">Période: ${format(new Date(data.periodStart), 'dd MMMM yyyy', { locale: fr })} - ${format(new Date(data.periodEnd), 'dd MMMM yyyy', { locale: fr })}</p>
    <p class="period">Généré le ${format(new Date(data.generatedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
  </div>

  <h2>Résumé Global</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-value">${data.summary.totalTimeMinutes}m</div>
      <div class="summary-label">Temps total</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.totalLessonsCompleted}</div>
      <div class="summary-label">Leçons complétées</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.averageQuizScore}%</div>
      <div class="summary-label">Score moyen</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.totalXPEarned}</div>
      <div class="summary-label">XP gagné</div>
    </div>
  </div>

  ${data.children.map(child => `
  <div class="child-section">
    <div class="child-header">
      <div class="avatar">${child.childName.charAt(0)}</div>
      <div>
        <h3 style="margin: 0;">${child.childName}</h3>
        <p style="margin: 0; color: #64748b; font-size: 13px;">${child.childAge ? `${child.childAge} ans • ` : ''}Niveau ${Math.floor(child.currentXP / 100) + 1}</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-value">${child.periodStats.totalTimeMinutes}m</div>
        <div class="stat-label">Temps d'apprentissage</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${child.periodStats.lessonsCompleted}</div>
        <div class="stat-label">Leçons complétées</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${child.periodStats.avgQuizScore}%</div>
        <div class="stat-label">Score moyen quiz</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${child.periodStats.xpEarned}</div>
        <div class="stat-label">XP gagné</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${child.currentStreak}</div>
        <div class="stat-label">Série actuelle</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${child.periodStats.achievementsEarned}</div>
        <div class="stat-label">Badges gagnés</div>
      </div>
    </div>

    ${child.performance.strengths.length > 0 ? `
    <h4 class="strength">Points forts</h4>
    <ul>
      ${child.performance.strengths.map(s => `<li>${s.subject}: ${s.avgScore}%</li>`).join('')}
    </ul>
    ` : ''}

    ${child.performance.struggles.length > 0 ? `
    <h4 class="struggle">À améliorer</h4>
    <ul>
      ${child.performance.struggles.map(s => `<li>${s.subject}: ${s.avgScore}%</li>`).join('')}
    </ul>
    ` : ''}

    <h4>Recommandations</h4>
    ${child.recommendations.map(r => `<div class="recommendation">${r}</div>`).join('')}
  </div>
  `).join('')}

  <footer style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px;">
    <p>NumériKids - Apprendre à coder en s'amusant</p>
  </footer>
</body>
</html>
    `;
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csv = 'Rapport NumériKids\n\n';
    csv += `Période,${reportData.periodStart},${reportData.periodEnd}\n`;
    csv += `Type,${reportData.reportType}\n\n`;
    
    csv += 'RÉSUMÉ GLOBAL\n';
    csv += `Temps total (min),${reportData.summary.totalTimeMinutes}\n`;
    csv += `Leçons complétées,${reportData.summary.totalLessonsCompleted}\n`;
    csv += `Score moyen,${reportData.summary.averageQuizScore}%\n`;
    csv += `XP total,${reportData.summary.totalXPEarned}\n\n`;

    csv += 'DÉTAIL PAR ENFANT\n';
    csv += 'Enfant,Temps (min),Leçons,Score Quiz,XP,Série,Badges\n';
    
    reportData.children.forEach(child => {
      csv += `${child.childName},${child.periodStats.totalTimeMinutes},${child.periodStats.lessonsCompleted},${child.periodStats.avgQuizScore}%,${child.periodStats.xpEarned},${child.currentStreak},${child.periodStats.achievementsEarned}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-numerikids-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export réussi',
      description: 'Le fichier CSV a été téléchargé'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (children.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Aucun enfant</h2>
          <p className="text-slate-400">Ajoutez un enfant pour voir les rapports de progression.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              Rapports de Progression
            </h1>
            <p className="text-slate-400 mt-1">
              Suivez les progrès d'apprentissage de vos enfants
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={generateReport}
              disabled={generating}
              className="border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={!reportData}
              className="border-slate-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button
              onClick={exportToPDF}
              disabled={exporting || !reportData}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Exporter PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-1.5 block">Enfant</label>
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Sélectionner un enfant" />
                </SelectTrigger>
                <SelectContent>
                  {children.length > 1 && (
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Tous les enfants
                      </div>
                    </SelectItem>
                  )}
                  {children.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xs text-white">
                          {child.name.charAt(0)}
                        </div>
                        {child.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-1.5 block">Période</label>
              <Select value={reportPeriod} onValueChange={(v) => setReportPeriod(v as ReportPeriod)}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Hebdomadaire (7 jours)
                    </div>
                  </SelectItem>
                  <SelectItem value="monthly">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Mensuel (30 jours)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        {reportData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{reportData.summary.totalTimeMinutes}m</p>
                  <p className="text-xs text-slate-400">Temps total</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{reportData.summary.totalLessonsCompleted}</p>
                  <p className="text-xs text-slate-400">Leçons</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{reportData.summary.averageQuizScore}%</p>
                  <p className="text-xs text-slate-400">Score moyen</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{reportData.summary.totalXPEarned}</p>
                  <p className="text-xs text-slate-400">XP gagné</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="children" className="data-[state=active]:bg-purple-500/20">
              <Users className="w-4 h-4 mr-2" />
              Par enfant
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-green-500/20">
              <Mail className="w-4 h-4 mr-2" />
              Rapports email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {reportData && (
              <>
                <div className="grid lg:grid-cols-2 gap-6">
                  <ReportTimeChart data={reportData} />
                  <ReportScoresChart data={reportData} />
                </div>
                <ReportStrengthsPanel data={reportData} />
              </>
            )}
          </TabsContent>

          <TabsContent value="children" className="space-y-6">
            {reportData?.children.map(child => (
              <ChildReportCard key={child.childId} child={child} />
            ))}
          </TabsContent>

          <TabsContent value="email">
            <EmailReportSettings children={children} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
