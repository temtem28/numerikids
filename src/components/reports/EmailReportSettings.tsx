import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, Bell, Calendar, Clock, Save, Loader2, 
  CheckCircle, Settings, Send, History 
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
}

interface ReportPreference {
  id?: string;
  child_id: string | null;
  report_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  email_enabled: boolean;
  include_time_spent: boolean;
  include_lessons: boolean;
  include_quiz_scores: boolean;
  include_xp: boolean;
  include_achievements: boolean;
  include_recommendations: boolean;
  preferred_day: number;
  preferred_time: string;
}

interface EmailReportSettingsProps {
  children: Child[];
}

export default function EmailReportSettings({ children }: EmailReportSettingsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [preferences, setPreferences] = useState<ReportPreference>({
    child_id: null,
    report_frequency: 'weekly',
    email_enabled: true,
    include_time_spent: true,
    include_lessons: true,
    include_quiz_scores: true,
    include_xp: true,
    include_achievements: true,
    include_recommendations: true,
    preferred_day: 1,
    preferred_time: '09:00'
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    loadPreferences();
    loadRecentReports();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('report_preferences')
      .select('*')
      .eq('parent_id', user.id)
      .is('child_id', null)
      .single();

    if (data) {
      setPreferences(data);
    }
    setLoading(false);
  };

  const loadRecentReports = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('generated_reports')
      .select('id, report_type, period_start, period_end, created_at, email_sent')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setRecentReports(data);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);

    try {
      if (preferences.id) {
        // Update existing
        await supabase
          .from('report_preferences')
          .update({
            ...preferences,
            updated_at: new Date().toISOString()
          })
          .eq('id', preferences.id);
      } else {
        // Insert new
        const { data } = await supabase
          .from('report_preferences')
          .insert({
            parent_id: user.id,
            ...preferences
          })
          .select()
          .single();

        if (data) {
          setPreferences(data);
        }
      }

      toast({
        title: 'Préférences sauvegardées',
        description: 'Vos paramètres de rapport ont été mis à jour.'
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les préférences',
        variant: 'destructive'
      });
    }

    setSaving(false);
  };

  const sendTestEmail = async () => {
    setSendingTest(true);

    try {
      // Queue a test email
      await supabase.from('email_queue').insert({
        recipient_email: user?.email,
        subject: 'Test - Rapport NumériKids',
        template_name: 'parent_report_test',
        template_data: {
          parentName: user?.email?.split('@')[0] || 'Parent',
          message: 'Ceci est un email de test pour vérifier vos paramètres de rapport.'
        },
        status: 'pending'
      });

      toast({
        title: 'Email de test envoyé',
        description: `Un email de test a été envoyé à ${user?.email}`
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer l\'email de test',
        variant: 'destructive'
      });
    }

    setSendingTest(false);
  };

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Settings Card */}
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Mail className="w-5 h-5 text-cyan-400" />
            Rapports automatiques par email
          </CardTitle>
          <CardDescription>
            Recevez des rapports de progression directement dans votre boîte mail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-cyan-400" />
              <div>
                <Label className="text-white">Activer les rapports par email</Label>
                <p className="text-sm text-slate-400">
                  Recevez automatiquement les rapports de progression
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, email_enabled: checked }))
              }
            />
          </div>

          {preferences.email_enabled && (
            <>
              {/* Frequency */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Fréquence des rapports</Label>
                  <Select 
                    value={preferences.report_frequency}
                    onValueChange={(value: any) => 
                      setPreferences(prev => ({ ...prev, report_frequency: value }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="never">Jamais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {preferences.report_frequency === 'weekly' && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Jour d'envoi</Label>
                    <Select 
                      value={preferences.preferred_day.toString()}
                      onValueChange={(value) => 
                        setPreferences(prev => ({ ...prev, preferred_day: parseInt(value) }))
                      }
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dayNames.map((day, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {preferences.report_frequency === 'monthly' && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Jour du mois</Label>
                    <Select 
                      value={preferences.preferred_day.toString()}
                      onValueChange={(value) => 
                        setPreferences(prev => ({ ...prev, preferred_day: parseInt(value) }))
                      }
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Content Options */}
              <div className="space-y-3">
                <Label className="text-slate-300">Contenu du rapport</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { key: 'include_time_spent', label: 'Temps d\'apprentissage' },
                    { key: 'include_lessons', label: 'Leçons complétées' },
                    { key: 'include_quiz_scores', label: 'Scores des quiz' },
                    { key: 'include_xp', label: 'XP gagné' },
                    { key: 'include_achievements', label: 'Badges et accomplissements' },
                    { key: 'include_recommendations', label: 'Recommandations personnalisées' }
                  ].map(item => (
                    <div 
                      key={item.key}
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                    >
                      <span className="text-sm text-slate-300">{item.label}</span>
                      <Switch
                        checked={(preferences as any)[item.key]}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({ ...prev, [item.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
            <Button
              onClick={savePreferences}
              disabled={saving}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Sauvegarder
            </Button>
            <Button
              variant="outline"
              onClick={sendTestEmail}
              disabled={sendingTest || !preferences.email_enabled}
              className="border-slate-700"
            >
              {sendingTest ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Envoyer un test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <History className="w-5 h-5 text-purple-400" />
            Historique des rapports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map(report => (
                <div 
                  key={report.id}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-700/50 rounded">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Rapport {report.report_type === 'weekly' ? 'hebdomadaire' : 'mensuel'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(report.period_start).toLocaleDateString('fr-FR')} - {new Date(report.period_end).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.email_sent && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Envoyé
                      </Badge>
                    )}
                    <span className="text-xs text-slate-500">
                      {new Date(report.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun rapport généré</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-cyan-400 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Comment ça marche ?</p>
              <p className="text-xs text-slate-400 mt-1">
                Les rapports automatiques sont générés selon la fréquence choisie et envoyés à votre adresse email ({user?.email}). 
                Vous pouvez également générer des rapports manuellement depuis l'onglet "Vue d'ensemble" et les exporter en PDF.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
