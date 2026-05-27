import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Clock, Shield, Calendar, Pause, Play } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  age: number;
  avatar_url?: string;
}

interface ParentalSettings {
  id?: string;
  child_id: string;
  daily_time_limit: number;
  scheduled_start_time: string | null;
  scheduled_end_time: string | null;
  content_restrictions: {
    allowScratch: boolean;
    allowPython: boolean;
    allowGames: boolean;
  };
  account_status: 'active' | 'paused';
}

export default function ParentalControls() {
  const [children, setChildren] = useState<Child[]>([]);
  const [settings, setSettings] = useState<Record<string, ParentalSettings>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChildrenAndSettings();
  }, []);

  const fetchChildrenAndSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: childrenData } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', user.id);


    if (childrenData) {
      setChildren(childrenData);
      
      const settingsMap: Record<string, ParentalSettings> = {};
      for (const child of childrenData) {
        const { data: settingData } = await supabase
          .from('parental_settings')
          .select('*')
          .eq('child_id', child.id)
          .single();

        settingsMap[child.id] = settingData || {
          child_id: child.id,
          daily_time_limit: 60,
          scheduled_start_time: null,
          scheduled_end_time: null,
          content_restrictions: {
            allowScratch: true,
            allowPython: true,
            allowGames: true
          },
          account_status: 'active'
        };
      }
      setSettings(settingsMap);
    }
    setLoading(false);
  };

  const saveSettings = async (childId: string) => {
    const setting = settings[childId];
    const { error } = await supabase
      .from('parental_settings')
      .upsert({
        ...setting,
        updated_at: new Date().toISOString()
      });

    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: 'Paramètres enregistrés' });
    }
  };

  const updateSetting = (childId: string, updates: Partial<ParentalSettings>) => {
    setSettings(prev => ({
      ...prev,
      [childId]: { ...prev[childId], ...updates }
    }));
  };

  if (loading) return <div className="text-white">Chargement...</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-8">
          Contrôle Parental
        </h1>

        {children.map(child => {
          const childSettings = settings[child.id];
          if (!childSettings) return null;

          return (
            <Card key={child.id} className="bg-slate-900/50 backdrop-blur-xl border-cyan-500/20 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {child.avatar_url && (
                    <img src={child.avatar_url} alt={child.name} className="w-16 h-16 rounded-full" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white">{child.name}</h2>
                    <p className="text-cyan-400">{child.age} ans</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    updateSetting(child.id, {
                      account_status: childSettings.account_status === 'active' ? 'paused' : 'active'
                    });
                    saveSettings(child.id);
                  }}
                  variant={childSettings.account_status === 'active' ? 'destructive' : 'default'}
                  className="gap-2"
                >
                  {childSettings.account_status === 'active' ? (
                    <><Pause className="w-4 h-4" /> Mettre en pause</>
                  ) : (
                    <><Play className="w-4 h-4" /> Activer</>
                  )}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Temps quotidien (minutes)
                  </Label>
                  <Input
                    type="number"
                    value={childSettings.daily_time_limit}
                    onChange={(e) => updateSetting(child.id, { daily_time_limit: parseInt(e.target.value) })}
                    className="bg-slate-800 border-cyan-500/30 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    Horaires autorisés
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={childSettings.scheduled_start_time || ''}
                      onChange={(e) => updateSetting(child.id, { scheduled_start_time: e.target.value })}
                      className="bg-slate-800 border-cyan-500/30 text-white"
                    />
                    <Input
                      type="time"
                      value={childSettings.scheduled_end_time || ''}
                      onChange={(e) => updateSetting(child.id, { scheduled_end_time: e.target.value })}
                      className="bg-slate-800 border-cyan-500/30 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Label className="text-white flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-green-400" />
                  Restrictions de contenu
                </Label>
                <div className="space-y-3">
                  {Object.entries(childSettings.content_restrictions).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-300 capitalize">
                        {key.replace('allow', 'Autoriser ')}
                      </span>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => 
                          updateSetting(child.id, {
                            content_restrictions: {
                              ...childSettings.content_restrictions,
                              [key]: checked
                            }
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => saveSettings(child.id)}
                className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              >
                Enregistrer les paramètres
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
