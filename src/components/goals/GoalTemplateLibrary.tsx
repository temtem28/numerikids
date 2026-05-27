import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Code,
  Flame,
  Clock,
  Trophy,
  Zap,
  Target,
  Star,
  Palette,
  Gamepad2,
  Award,
  Search,
  Filter,
  Sparkles,
  ChevronRight,
  Coins,
  Calendar,
  Users,
  GraduationCap,
  Rocket,
  Brain,
  Flag,
  CheckCircle2,
  X,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  goal_type: string;
  target_value: number;
  suggested_reward: number;
  category: string;
  age_group: string;
  skill_level: string;
  icon: string;
  color: string;
  duration_days: number;
  is_featured: boolean;
  popularity_score: number;
}

interface Child {
  id: string;
  pseudo: string;
  avatar_url?: string;
  birth_date?: string;
  level?: number;
}

interface GoalTemplateLibraryProps {
  children: Child[];
  onGoalCreated: () => void;
  parentId: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  code: Code,
  blocks: Gamepad2,
  compass: Target,
  gamepad: Gamepad2,
  bug: Target,
  building: GraduationCap,
  brain: Brain,
  smartphone: Rocket,
  search: Search,
  star: Star,
  zap: Zap,
  trophy: Trophy,
  rocket: Rocket,
  flame: Flame,
  crown: Award,
  clock: Clock,
  hourglass: Clock,
  timer: Clock,
  medal: Award,
  palette: Palette,
  book: BookOpen,
  film: Palette,
  target: Target,
  flag: Flag,
  award: Award,
  'check-circle': CheckCircle2
};

const colorMap: Record<string, string> = {
  cyan: 'from-cyan-500 to-cyan-600',
  purple: 'from-purple-500 to-purple-600',
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  yellow: 'from-yellow-500 to-yellow-600',
  red: 'from-red-500 to-red-600',
  indigo: 'from-indigo-500 to-indigo-600',
  amber: 'from-amber-500 to-amber-600',
  gold: 'from-yellow-400 to-amber-500',
  pink: 'from-pink-500 to-pink-600',
  violet: 'from-violet-500 to-violet-600',
  teal: 'from-teal-500 to-teal-600',
  rose: 'from-rose-500 to-rose-600',
  slate: 'from-slate-400 to-slate-500'
};

const categoryLabels: Record<string, string> = {
  coding: 'Programmation',
  progression: 'Progression',
  consistency: 'Régularité',
  time: 'Temps',
  achievements: 'Succès',
  creative: 'Créativité',
  challenge: 'Défis'
};

const ageGroupLabels: Record<string, string> = {
  young: '5-7 ans',
  middle: '8-10 ans',
  older: '11-13 ans',
  all: 'Tous âges'
};

const skillLevelLabels: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
  all: 'Tous niveaux'
};

const goalTypeLabels: Record<string, string> = {
  lessons: 'Leçons',
  xp: 'Points XP',
  streak: 'Série',
  time: 'Temps (min)',
  achievements: 'Succès',
  custom: 'Personnalisé'
};

export const GoalTemplateLibrary: React.FC<GoalTemplateLibraryProps> = ({
  children,
  onGoalCreated,
  parentId
}) => {
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  
  // Customization dialog state
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string>(children[0]?.id || '');
  const [customizations, setCustomizations] = useState({
    title: '',
    description: '',
    target_value: 0,
    reward_coins: 0,
    duration_days: 7,
    priority: 'medium'
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, selectedAgeGroup, selectedSkillLevel, showFeaturedOnly, searchQuery]);

  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('goal-manager', {
        body: {
          action: 'list_templates',
          category: selectedCategory,
          age_group: selectedAgeGroup,
          skill_level: selectedSkillLevel,
          featured_only: showFeaturedOnly,
          search: searchQuery
        }
      });

      if (error) throw error;
      setTemplates(data.templates || []);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erreur lors du chargement des modèles');
    } finally {
      setLoading(false);
    }
  };

  const openCustomizeDialog = (template: GoalTemplate) => {
    setSelectedTemplate(template);
    setCustomizations({
      title: template.name,
      description: template.description || '',
      target_value: template.target_value,
      reward_coins: template.suggested_reward,
      duration_days: template.duration_days || 7,
      priority: 'medium'
    });
    setCustomizeDialogOpen(true);
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate || !selectedChildId) {
      toast.error('Veuillez sélectionner un enfant');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('goal-manager', {
        body: {
          action: 'create_from_template',
          template_id: selectedTemplate.id,
          child_id: selectedChildId,
          parent_id: parentId,
          customizations: {
            title: customizations.title,
            description: customizations.description,
            target_value: customizations.target_value,
            reward_coins: customizations.reward_coins,
            duration_days: customizations.duration_days,
            priority: customizations.priority
          }
        }
      });

      if (error) throw error;

      toast.success('Objectif créé avec succès !');
      setCustomizeDialogOpen(false);
      setSelectedTemplate(null);
      onGoalCreated();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Erreur lors de la création de l\'objectif');
    } finally {
      setCreating(false);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Target;
    return IconComponent;
  };

  const getColorClass = (color: string) => {
    return colorMap[color] || 'from-cyan-500 to-cyan-600';
  };

  const featuredTemplates = templates.filter(t => t.is_featured);
  const regularTemplates = templates.filter(t => !t.is_featured);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="bg-slate-900/50 border-cyan-500/20">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher un modèle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabels[cat] || cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700">
                  <SelectValue placeholder="Âge" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Tous âges</SelectItem>
                  <SelectItem value="young">5-7 ans</SelectItem>
                  <SelectItem value="middle">8-10 ans</SelectItem>
                  <SelectItem value="older">11-13 ans</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700">
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showFeaturedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                className={showFeaturedOnly 
                  ? "bg-gradient-to-r from-yellow-500 to-amber-500" 
                  : "border-slate-700 text-slate-300"
                }
              >
                <Star className="w-4 h-4 mr-1" />
                Populaires
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Templates */}
      {featuredTemplates.length > 0 && !showFeaturedOnly && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Modèles populaires</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredTemplates.slice(0, 4).map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => openCustomizeDialog(template)}
                getIcon={getIcon}
                getColorClass={getColorClass}
                featured
              />
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {showFeaturedOnly ? 'Modèles populaires' : 'Tous les modèles'}
          </h3>
          <Badge variant="outline" className="text-slate-400 border-slate-600">
            {templates.length} modèle{templates.length > 1 ? 's' : ''}
          </Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Card key={i} className="bg-slate-900/50 border-slate-700 animate-pulse">
                <CardContent className="p-6 h-48" />
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucun modèle trouvé
              </h3>
              <p className="text-slate-400">
                Essayez de modifier vos filtres de recherche
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(showFeaturedOnly ? featuredTemplates : regularTemplates.length > 0 ? regularTemplates : templates).map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <TemplateCard
                  template={template}
                  onSelect={() => openCustomizeDialog(template)}
                  getIcon={getIcon}
                  getColorClass={getColorClass}
                  featured={template.is_featured}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Customization Dialog */}
      <Dialog open={customizeDialogOpen} onOpenChange={setCustomizeDialogOpen}>
        <DialogContent className="bg-slate-900 border-cyan-500/20 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-cyan-400" />
              Personnaliser l'objectif
            </DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6">
              {/* Template Preview */}
              <div className={`p-4 rounded-lg bg-gradient-to-r ${getColorClass(selectedTemplate.color)} bg-opacity-20`}>
                <div className="flex items-center gap-3">
                  {React.createElement(getIcon(selectedTemplate.icon), {
                    className: "w-8 h-8 text-white"
                  })}
                  <div>
                    <h4 className="font-semibold text-white">{selectedTemplate.name}</h4>
                    <p className="text-sm text-white/70">{selectedTemplate.description}</p>
                  </div>
                </div>
              </div>

              {/* Child Selection */}
              <div>
                <Label className="text-slate-300">Attribuer à</Label>
                <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 mt-1">
                    <SelectValue placeholder="Sélectionner un enfant" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {children.map(child => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.pseudo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <Label className="text-slate-300">Titre de l'objectif</Label>
                <Input
                  value={customizations.title}
                  onChange={(e) => setCustomizations(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-slate-800/50 border-slate-700 mt-1"
                />
              </div>

              {/* Target Value */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-slate-300">
                    Valeur cible ({goalTypeLabels[selectedTemplate.goal_type]})
                  </Label>
                  <span className="text-cyan-400 font-semibold">{customizations.target_value}</span>
                </div>
                <Slider
                  value={[customizations.target_value]}
                  onValueChange={([value]) => setCustomizations(prev => ({ ...prev, target_value: value }))}
                  min={1}
                  max={selectedTemplate.target_value * 3}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1</span>
                  <span className="text-cyan-400/50">Suggéré: {selectedTemplate.target_value}</span>
                  <span>{selectedTemplate.target_value * 3}</span>
                </div>
              </div>

              {/* Reward */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-slate-300 flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    Récompense
                  </Label>
                  <span className="text-yellow-400 font-semibold">{customizations.reward_coins} pièces</span>
                </div>
                <Slider
                  value={[customizations.reward_coins]}
                  onValueChange={([value]) => setCustomizations(prev => ({ ...prev, reward_coins: value }))}
                  min={10}
                  max={500}
                  step={10}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>10</span>
                  <span className="text-yellow-400/50">Suggéré: {selectedTemplate.suggested_reward}</span>
                  <span>500</span>
                </div>
              </div>

              {/* Duration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-slate-300 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    Durée
                  </Label>
                  <span className="text-purple-400 font-semibold">{customizations.duration_days} jours</span>
                </div>
                <Slider
                  value={[customizations.duration_days]}
                  onValueChange={([value]) => setCustomizations(prev => ({ ...prev, duration_days: value }))}
                  min={1}
                  max={90}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1 jour</span>
                  <span className="text-purple-400/50">Suggéré: {selectedTemplate.duration_days || 7} jours</span>
                  <span>90 jours</span>
                </div>
              </div>

              {/* Priority */}
              <div>
                <Label className="text-slate-300">Priorité</Label>
                <Select 
                  value={customizations.priority} 
                  onValueChange={(v) => setCustomizations(prev => ({ ...prev, priority: v }))}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCustomizeDialogOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateFromTemplate}
              disabled={creating || !selectedChildId}
              className="bg-gradient-to-r from-cyan-500 to-purple-500"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Création...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Créer l'objectif
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Template Card Component
interface TemplateCardProps {
  template: GoalTemplate;
  onSelect: () => void;
  getIcon: (name: string) => React.ComponentType<any>;
  getColorClass: (color: string) => string;
  featured?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onSelect,
  getIcon,
  getColorClass,
  featured
}) => {
  const IconComponent = getIcon(template.icon);
  const colorClass = getColorClass(template.color);

  return (
    <Card 
      className={`bg-slate-900/50 border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer group ${
        featured ? 'ring-1 ring-yellow-500/30' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-lg bg-gradient-to-r ${colorClass}`}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div className="flex gap-1">
            {featured && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                <Star className="w-3 h-3 mr-1" />
                Populaire
              </Badge>
            )}
          </div>
        </div>

        {/* Title and description */}
        <h4 className="font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
          {template.name}
        </h4>
        <p className="text-sm text-slate-400 line-clamp-2 mb-3">
          {template.description}
        </p>

        {/* Meta info */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
            {categoryLabels[template.category] || template.category}
          </Badge>
          <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
            {ageGroupLabels[template.age_group]}
          </Badge>
          <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
            {skillLevelLabels[template.skill_level]}
          </Badge>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-cyan-400">
              <Target className="w-3.5 h-3.5" />
              {template.target_value}
            </span>
            <span className="flex items-center gap-1 text-yellow-400">
              <Coins className="w-3.5 h-3.5" />
              {template.suggested_reward}
            </span>
          </div>
          {template.duration_days && (
            <span className="flex items-center gap-1 text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              {template.duration_days}j
            </span>
          )}
        </div>

        {/* Hover action */}
        <div className="mt-3 pt-3 border-t border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-sm">
            Utiliser ce modèle
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalTemplateLibrary;
