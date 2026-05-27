-- Migration: Goal Templates Library
-- Created: 2024-02-03
-- Description: Creates goal_templates table with pre-made templates for different age groups and skill levels

-- Create goal_templates table
CREATE TABLE IF NOT EXISTS goal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  goal_type VARCHAR(50) NOT NULL,
  target_value INTEGER NOT NULL,
  suggested_reward INTEGER NOT NULL DEFAULT 50,
  category VARCHAR(100) NOT NULL,
  age_group VARCHAR(50) NOT NULL, -- 'young' (5-7), 'middle' (8-10), 'older' (11-13), 'all'
  skill_level VARCHAR(50) NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'all'
  icon VARCHAR(50),
  color VARCHAR(50),
  duration_days INTEGER, -- suggested deadline in days
  is_featured BOOLEAN DEFAULT false,
  popularity_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_goal_templates_category ON goal_templates(category);
CREATE INDEX IF NOT EXISTS idx_goal_templates_age_group ON goal_templates(age_group);
CREATE INDEX IF NOT EXISTS idx_goal_templates_skill_level ON goal_templates(skill_level);
CREATE INDEX IF NOT EXISTS idx_goal_templates_featured ON goal_templates(is_featured);

-- Enable RLS
ALTER TABLE goal_templates ENABLE ROW LEVEL SECURITY;

-- Everyone can read templates
CREATE POLICY "Anyone can view goal templates" ON goal_templates
  FOR SELECT USING (true);

-- Seed goal templates

-- CODING CATEGORY - Young (5-7)
INSERT INTO goal_templates (name, description, goal_type, target_value, suggested_reward, category, age_group, skill_level, icon, color, duration_days, is_featured) VALUES
('Premier pas en code', 'Complète ta première leçon de programmation', 'lessons', 1, 25, 'coding', 'young', 'beginner', 'code', 'cyan', 7, true),
('Petit programmeur', 'Termine 3 leçons de Scratch Jr', 'lessons', 3, 50, 'coding', 'young', 'beginner', 'blocks', 'purple', 14, false),
('Explorateur numérique', 'Découvre 5 concepts de base', 'lessons', 5, 75, 'coding', 'young', 'beginner', 'compass', 'blue', 21, false),
('Créateur de jeux', 'Crée ton premier mini-jeu', 'lessons', 2, 100, 'coding', 'young', 'intermediate', 'gamepad', 'green', 14, true);

-- CODING CATEGORY - Middle (8-10)
INSERT INTO goal_templates (name, description, goal_type, target_value, suggested_reward, category, age_group, skill_level, icon, color, duration_days, is_featured) VALUES
('Maître des blocs', 'Complète 5 exercices Scratch', 'lessons', 5, 75, 'coding', 'middle', 'beginner', 'blocks', 'orange', 14, false),
('Apprenti Python', 'Termine 3 leçons Python débutant', 'lessons', 3, 100, 'coding', 'middle', 'intermediate', 'code', 'yellow', 14, true),
('Chasseur de bugs', 'Corrige 10 erreurs dans ton code', 'custom', 10, 150, 'coding', 'middle', 'intermediate', 'bug', 'red', 21, false),
('Architecte de code', 'Crée 3 projets complets', 'lessons', 3, 200, 'coding', 'middle', 'advanced', 'building', 'indigo', 30, false);

-- CODING CATEGORY - Older (11-13)
INSERT INTO goal_templates (name, description, goal_type, target_value, suggested_reward, category, age_group, skill_level, icon, color, duration_days, is_featured) VALUES
('Développeur en herbe', 'Complète 10 leçons Python', 'lessons', 10, 150, 'coding', 'older', 'beginner', 'code', 'cyan', 30, false),
('Expert algorithmes', 'Résous 5 problèmes algorithmiques', 'lessons', 5, 200, 'coding', 'older', 'intermediate', 'brain', 'purple', 21, true),
('Créateur d''apps', 'Termine un projet d''application', 'lessons', 8, 300, 'coding', 'older', 'advanced', 'smartphone', 'green', 45, false),
('Maître du débogage', 'Utilise le débogueur 15 fois', 'custom', 15, 175, 'coding', 'older', 'advanced', 'search', 'amber', 30, false);

-- XP & PROGRESSION CATEGORY
INSERT INTO goal_templates (name, description, goal_type, target_value, suggested_reward, category, age_group, skill_level, icon, color, duration_days, is_featured) VALUES
('Collecteur d''étoiles', 'Gagne 100 XP', 'xp', 100, 30, 'progression', 'young', 'beginner', 'star', 'yellow', 7, true),
('Champion XP', 'Accumule 500 XP', 'xp', 500, 75, 'progression', 'middle', 'beginner', 'zap', 'amber', 14, false),
('Légende XP', 'Atteins 1000 XP', 'xp', 1000, 150, 'progression', 'older', 'intermediate', 'trophy', 'gold', 21, true),
('Super Learner', 'Gagne 2000 XP en un mois', 'xp', 2000, 250, 'progression', 'all', 'advanced', 'rocket', 'purple', 30, false);

-- STREAK CATEGORY
INSERT INTO goal_templates (name, description, goal_type, target_value, suggested_reward, category, age_group, skill_level, icon, color, duration_days, is_featured) VALUES
('Première flamme', 'Maintiens une série de 3 jours', 'streak', 3, 40, 'consistency', 'young', 'beginner', 'flame', 'orange', 7, true),
('Semaine parfaite', 'Série de 7 jours consécutifs', 'streak', 7, 100, 'consistency', 'all', 'beginner', 'flame', 'red', 10, true),
('Deux semaines de feu', 'Garde ta série pendant 14 jours', 'streak', 14, 175, 'consistency', 'all', 'intermediate', 'flame', 'orange', 20, false),
('Mois de champion', 'Série incroyable de 30 jours', 'streak', 30, 400, 'consistency', 'all', 'advanced', 'crown', 'gold', 35, true);

-- TIME-BASED CATEGORY
INSERT INTO goal_templates (name, description, goal_type, target_value, suggested_reward, category, age_group, skill_level, icon, color, duration_days, is_featured) VALUES
('Petit moment code', '15 minutes d''apprentissage', 'time', 15, 20, 'time', 'young', 'beginner', 'clock', 'blue', 1, false),
('Session focus', '30 minutes de concentration', 'time', 30, 40, 'time', 'middle', 'beginner', 'clock', 'cyan', 1, true),
('Heure productive', '60 minutes d''étude', 'time', 60, 75, 'time', 'older', 'intermediate', 'hourglass', 'purple', 1, false),
('Marathon d''apprentissage', '2 heures de code cette semaine', 'time', 120, 150, 'time', 'all', 'advanced', 'timer', 'indigo', 7, false);

-- ACHIEVEMENTS CATEGORY
INSERT INTO goal_templates (name, description, goal_type, target_value, suggested_reward, category, age_group, skill_level, icon, color, duration_days, is_featured) VALUES
('Collectionneur bronze', 'Débloque 2 succès', 'achievements', 2, 50, 'achievements', 'young', 'beginner', 'medal', 'amber', 14, false),
('Collectionneur argent', 'Débloque 5 succès', 'achievements', 5, 125, 'achievements', 'middle', 'intermediate', 'medal', 'slate', 30, true),
('Collectionneur or', 'Débloque 10 succès', 'achievements', 10, 250, 'achievements', 'older', 'advanced', 'trophy', 'yellow', 60, false),
('Maître des succès', 'Obtiens 15 succès différents', 'achievements', 15, 400, 'achievements', 'all', 'advanced', 'crown', 'gold', 90, false);

-- CREATIVE CATEGORY
INSERT INTO goal_templates (name, description, goal_type, target_value, suggested_reward, category, age_group, skill_level, icon, color, duration_days, is_featured) VALUES
('Artiste digital', 'Crée 3 projets créatifs', 'lessons', 3, 80, 'creative', 'young', 'beginner', 'palette', 'pink', 21, true),
('Inventeur de jeux', 'Conçois 2 jeux originaux', 'lessons', 2, 150, 'creative', 'middle', 'intermediate', 'gamepad', 'violet', 30, false),
('Storyteller code', 'Crée une histoire interactive', 'lessons', 1, 100, 'creative', 'all', 'intermediate', 'book', 'teal', 14, false),
('Animateur numérique', 'Réalise 5 animations', 'lessons', 5, 200, 'creative', 'older', 'advanced', 'film', 'rose', 45, false);

-- CHALLENGE CATEGORY
INSERT INTO goal_templates (name, description, goal_type, target_value, suggested_reward, category, age_group, skill_level, icon, color, duration_days, is_featured) VALUES
('Défi du jour', 'Complète le défi quotidien', 'custom', 1, 30, 'challenge', 'all', 'beginner', 'target', 'red', 1, true),
('Semaine de défis', 'Réussis 5 défis cette semaine', 'custom', 5, 100, 'challenge', 'all', 'intermediate', 'flag', 'orange', 7, false),
('Champion des défis', 'Termine 10 défis en un mois', 'custom', 10, 200, 'challenge', 'all', 'advanced', 'award', 'gold', 30, true),
('Perfectionniste', 'Obtiens 100% sur 3 quiz', 'custom', 3, 150, 'challenge', 'all', 'advanced', 'check-circle', 'green', 14, false);

-- Additional templates
INSERT INTO goal_templates (name, description, goal_type, target_value, suggested_reward, category, age_group, skill_level, icon, color, duration_days, is_featured) VALUES
('Debugger en herbe', 'Trouve et corrige 5 bugs dans ton code', 'custom', 5, 100, 'coding', 'middle', 'intermediate', 'bug', 'red', 14, false),
('Projet personnel', 'Termine un projet de ton choix', 'lessons', 1, 250, 'coding', 'all', 'advanced', 'rocket', 'indigo', 30, true),
('Code reviewer', 'Révise 3 de tes anciens projets', 'custom', 3, 75, 'coding', 'older', 'intermediate', 'search', 'blue', 14, false),
('Niveau supérieur', 'Monte d''un niveau', 'xp', 500, 100, 'progression', 'all', 'beginner', 'trending-up', 'green', 14, false),
('Double niveau', 'Monte de 2 niveaux', 'xp', 1000, 200, 'progression', 'all', 'intermediate', 'trending-up', 'emerald', 30, false),
('Weekend warrior', 'Code pendant 2 weekends consécutifs', 'streak', 4, 80, 'consistency', 'all', 'beginner', 'calendar', 'blue', 14, false),
('Matinal du code', 'Apprends le matin pendant 5 jours', 'custom', 5, 100, 'consistency', 'all', 'intermediate', 'sun', 'yellow', 7, false),
('Portfolio créatif', 'Crée 5 projets pour ton portfolio', 'lessons', 5, 300, 'creative', 'older', 'advanced', 'folder', 'violet', 60, false),
('Remix master', 'Modifie 3 projets existants', 'custom', 3, 100, 'creative', 'middle', 'intermediate', 'edit', 'pink', 21, false);

-- Update popularity scores for featured templates
UPDATE goal_templates SET popularity_score = 25 WHERE name = 'Semaine parfaite';
UPDATE goal_templates SET popularity_score = 20 WHERE name = 'Champion XP';
UPDATE goal_templates SET popularity_score = 18 WHERE name = 'Apprenti Python';
UPDATE goal_templates SET popularity_score = 15 WHERE name = 'Collecteur d''étoiles';
UPDATE goal_templates SET popularity_score = 12 WHERE name = 'Session focus';
UPDATE goal_templates SET popularity_score = 10 WHERE name = 'Premier pas en code';
UPDATE goal_templates SET popularity_score = 8 WHERE name = 'Première flamme';
