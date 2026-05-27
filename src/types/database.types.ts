// Additional database types

export interface StoreItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
}

export interface UserInventory {
  id: string;
  user_id: string;
  item_id: string;
  is_equipped: boolean;
  acquired_at: string;
  store_items?: StoreItem;
}

export interface Reward {
  id: string;
  parent_id: string;
  title: string;
  description?: string;
  cost: number;
  is_active: boolean;
  created_at?: string;
}

export interface RewardRedemption {
  id: string;
  child_id: string;
  reward_id: string;
  status: string;
  redeemed_at: string;
  fulfilled_at?: string;
}

export interface Household {
  id: string;
  parent_id: string;
  name: string;
  created_at?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Saga {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  thumbnail_url?: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
}


export interface LearningSession {
  id: string;
  child_id: string;
  lesson_id?: string;
  saga_id?: string;
  chapter_id?: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  completed: boolean;
  score?: number;
  xp_earned?: number;
  created_at?: string;
}

export interface ExerciseCompletion {
  id: string;
  child_id: string;
  session_id?: string;
  exercise_id: string;
  exercise_type: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  attempts: number;
  success: boolean;
  score?: number;
  code_submitted?: string;
  hints_used?: number;
  created_at?: string;
}

export interface QuizAttempt {
  id: string;
  child_id: string;
  session_id?: string;
  quiz_id: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  answers?: any;
  created_at?: string;
}

export interface ActivityLog {
  id: string;
  child_id: string;
  activity_type: string;
  activity_name: string;
  metadata?: any;
  points_earned?: number;
  timestamp: string;
  created_at?: string;
}

export interface ParentProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChildProfile {
  id: string;
  parent_id: string;
  name: string;
  age?: number;
  avatar_url?: string;
  grade_level?: string;
  xp_points: number;
  coins: number;
  streak_days: number;
  last_active?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  household_id?: string;
}

/** Ligne dans `child_progress` (une entrée par leçon terminée). */
export interface ChildProgressLessonRow {
  id?: string;
  child_id: string;
  lesson_id: string;
  saga_id: string;
  completed?: boolean;
  completed_at?: string;
  created_at?: string;
}

/** Ancien modèle agrégé (si utilisé ailleurs). */
export interface ChildProgress {
  id: string;
  child_id: string;
  saga_id: string;
  completed_lessons: number[];
  current_lesson: number;
  total_xp: number;
  created_at?: string;
  updated_at?: string;
}

export interface ParentalSettings {
  id: string;
  child_id: string;
  daily_time_limit_minutes: number;
  allowed_start_hour: number;
  allowed_end_hour: number;
  content_filter_violence: boolean;
  content_filter_mature: boolean;
  ai_help_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}
