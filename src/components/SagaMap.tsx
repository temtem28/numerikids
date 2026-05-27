import React, { useState } from 'react';
import { Lock, CheckCircle, Star, Play } from 'lucide-react';
import { Button } from './ui/button';

interface Lesson {
  id: number;
  title: string;
  description: string;
  type: 'scratch' | 'python' | 'quiz';
  duration: string;
  xp: number;
  position: { x: number; y: number };
}

interface SagaMapProps {
  sagaId: string;
  sagaTitle: string;
  backgroundImage: string;
  lessons: Lesson[];
  completedLessons: number[];
  currentLesson: number;
  onLessonSelect: (lessonId: number) => void;
}

export const SagaMap: React.FC<SagaMapProps> = ({
  sagaTitle,
  backgroundImage,
  lessons,
  completedLessons,
  currentLesson,
  onLessonSelect,
}) => {
  const [hoveredLesson, setHoveredLesson] = useState<number | null>(null);

  const isLessonUnlocked = (lessonId: number) => {
    if (lessonId === 1) return true;
    return completedLessons.includes(lessonId - 1);
  };

  const isLessonCompleted = (lessonId: number) => {
    return completedLessons.includes(lessonId);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-30 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      
      {/* Starfield */}
      <div className="stars"></div>
      <div className="stars2"></div>

      {/* Header */}
      <div className="relative z-10 p-8">
        <h1 className="text-4xl font-bold neon-text mb-2">{sagaTitle}</h1>
        <p className="text-cyan-300">
          Complète {lessons.length === 1 ? 'la leçon' : `les ${lessons.length} leçons`} pour maîtriser cette saga
        </p>
      </div>

      {/* SVG Path Container */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {lessons.map((lesson, index) => {
          if (index < lessons.length - 1) {
            const nextLesson = lessons[index + 1];
            const isCompleted = completedLessons.includes(lesson.id);
            return (
              <line
                key={`path-${lesson.id}`}
                x1={`${lesson.position.x}%`}
                y1={`${lesson.position.y}%`}
                x2={`${nextLesson.position.x}%`}
                y2={`${nextLesson.position.y}%`}
                stroke={isCompleted ? "url(#pathGradient)" : "#334155"}
                strokeWidth="4"
                strokeDasharray={isCompleted ? "0" : "10,5"}
                className={isCompleted ? "animate-pulse" : ""}
              />
            );
          }
          return null;
        })}
      </svg>

      {/* Lesson Nodes */}
      <div className="relative w-full h-full" style={{ zIndex: 2 }}>
        {lessons.map((lesson) => {
          const unlocked = isLessonUnlocked(lesson.id);
          const completed = isLessonCompleted(lesson.id);
          const isCurrent = lesson.id === currentLesson;

          return (
            <div
              key={lesson.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${lesson.position.x}%`, top: `${lesson.position.y}%` }}
              onMouseEnter={() => setHoveredLesson(lesson.id)}
              onMouseLeave={() => setHoveredLesson(null)}
            >
              {/* Lesson Node */}
              <button
                onClick={() => unlocked && onLessonSelect(lesson.id)}
                disabled={!unlocked}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  completed
                    ? 'bg-gradient-to-br from-cyan-500 to-purple-600 neon-glow scale-110'
                    : unlocked
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 hover:scale-125 hover:neon-glow'
                    : 'bg-slate-700 opacity-50'
                } ${isCurrent ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
              >
                <div className="text-center">
                  {completed ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : unlocked ? (
                    <Play className="w-8 h-8 text-white" />
                  ) : (
                    <Lock className="w-8 h-8 text-slate-400" />
                  )}
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white whitespace-nowrap">
                    {lesson.id}
                  </span>
                </div>
              </button>

              {/* Hover Preview */}
              {hoveredLesson === lesson.id && unlocked && (
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-72 bg-slate-900/95 neon-border rounded-lg p-4 shadow-2xl animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-bold text-cyan-300">{lesson.title}</h3>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{lesson.description}</p>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>⏱️ {lesson.duration}</span>
                    <span>⭐ {lesson.xp} XP</span>
                    <span className="px-2 py-1 bg-purple-600/50 rounded">{lesson.type}</span>
                  </div>
                  {unlocked && !completed && (
                    <Button
                      onClick={() => onLessonSelect(lesson.id)}
                      className="w-full mt-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                    >
                      Commencer
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
