import React, { useState, useRef } from 'react';
import { Upload, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';

interface ChildProfileFormProps {
  childData?: any;
  onSubmit: (data: any) => void | Promise<void>;
  loading: boolean;
  /** Erreur serveur / base : affichée en haut, toujours visible */
  submitError?: string;
}

const ChildProfileForm: React.FC<ChildProfileFormProps> = ({ childData, onSubmit, loading, submitError }) => {
  const [pseudo, setPseudo] = useState(childData?.pseudo || '');
  const [birthYear, setBirthYear] = useState(childData?.birth_year || new Date().getFullYear() - 8);
  const [gradeLevel, setGradeLevel] = useState(childData?.grade_level || 'CE2');
  const [avatarUrl, setAvatarUrl] = useState(childData?.avatar_url || '');
  const [dailyTimeLimit, setDailyTimeLimit] = useState(childData?.daily_time_limit || 60);
  const [learningPreferences, setLearningPreferences] = useState<string[]>(
    childData?.learning_preferences || []
  );
  const [allowedContentTypes, setAllowedContentTypes] = useState<string[]>(
    childData?.allowed_content_types || ['video', 'quiz', 'exercise', 'game']
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i - 5);
  const gradeLevels = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème'];
  const preferences = ['visual', 'auditory', 'kinesthetic', 'reading'];
  const contentTypes = [
    { id: 'video', label: 'Vidéos' },
    { id: 'quiz', label: 'Quiz' },
    { id: 'exercise', label: 'Exercices' },
    { id: 'game', label: 'Jeux' }
  ];

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error, data } = await supabase.storage
      .from('child-avatars')
      .upload(filePath, file);

    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage
        .from('child-avatars')
        .getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
    }
    setUploading(false);
  };

  const togglePreference = (pref: string) => {
    setLearningPreferences(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const toggleContentType = (type: string) => {
    setAllowedContentTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async () => {
    await Promise.resolve(
      onSubmit({
        pseudo,
        birth_year: birthYear,
        grade_level: gradeLevel,
        avatar_url: avatarUrl,
        daily_time_limit: dailyTimeLimit,
        learning_preferences: learningPreferences,
        allowed_content_types: allowedContentTypes,
      })
    );
  };

  return (
    <div className="flex flex-col gap-4 min-h-0">
      {!!submitError?.trim() && (
        <div
          role="alert"
          className="shrink-0 rounded-md border border-red-500/60 bg-red-950/50 px-3 py-2 text-sm text-red-100"
        >
          {submitError}
        </div>
      )}
      <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 min-h-0">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 bg-cyan-500 rounded-full p-2 hover:bg-cyan-600"
          >
            <Upload className="w-4 h-4 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
        {uploading && <p className="text-sm text-cyan-400">Upload...</p>}
      </div>

      <div>
        <Label className="text-white">Nom</Label>
        <Input
          placeholder="Nom de l'enfant"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Année de naissance</Label>
          <select
            value={birthYear}
            onChange={(e) => setBirthYear(Number(e.target.value))}
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-white">Niveau scolaire</Label>
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
          >
            {gradeLevels.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label className="text-white mb-2 block">Temps quotidien (minutes): {dailyTimeLimit}</Label>
        <Slider
          value={[dailyTimeLimit]}
          onValueChange={(val) => setDailyTimeLimit(val[0])}
          min={15}
          max={180}
          step={15}
          className="w-full"
        />
      </div>

      <div>
        <Label className="text-white mb-2 block">Préférences d'apprentissage</Label>
        <div className="grid grid-cols-2 gap-2">
          {preferences.map(pref => (
            <div key={pref} className="flex items-center space-x-2 bg-slate-800/50 p-2 rounded">
              <Checkbox
                checked={learningPreferences.includes(pref)}
                onCheckedChange={() => togglePreference(pref)}
                className="border-cyan-500"
              />
              <label className="text-sm text-white capitalize">{pref}</label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-white mb-2 block">Types de contenu autorisés</Label>
        <div className="grid grid-cols-2 gap-2">
          {contentTypes.map(type => (
            <div key={type.id} className="flex items-center space-x-2 bg-slate-800/50 p-2 rounded">
              <Checkbox
                checked={allowedContentTypes.includes(type.id)}
                onCheckedChange={() => toggleContentType(type.id)}
                className="border-cyan-500"
              />
              <label className="text-sm text-white">{type.label}</label>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !pseudo.trim()}
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500"
      >
        {loading ? 'Enregistrement...' : childData ? 'Mettre à jour' : 'Créer le profil'}
      </Button>
      {!pseudo.trim() && (
        <p className="text-sm text-amber-400/90 text-center">Indique le nom de l&apos;enfant pour activer le bouton.</p>
      )}
      </div>
    </div>
  );
};

export default ChildProfileForm;
