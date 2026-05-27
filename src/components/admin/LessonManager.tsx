import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import LessonEditor from './LessonEditor';

interface Lesson {
  id: string;
  lesson_id: string;
  title: string;
  saga_id: string;
  quest_number: number;
  lesson_number: number;
  order_index: number;
  is_published: boolean;
}

export default function LessonManager() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    const { data, error } = await supabase.functions.invoke('admin-lesson-manager', {
      body: { action: 'list' }
    });
    if (!error && data?.data) {
      setLessons(data.data);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lesson?')) return;
    await supabase.functions.invoke('admin-lesson-manager', {
      body: { action: 'delete', lessonId: id }
    });
    loadLessons();
  };

  const moveLesson = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= lessons.length) return;
    
    const lesson = lessons[index];
    await supabase.functions.invoke('admin-lesson-manager', {
      body: { action: 'reorder', lessonId: lesson.id, newOrder: newIndex }
    });
    loadLessons();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Lessons</h2>
        <Button onClick={() => { setEditingLesson(null); setShowEditor(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Lesson
        </Button>
      </div>

      {showEditor ? (
        <LessonEditor 
          lesson={editingLesson} 
          onSave={() => { setShowEditor(false); loadLessons(); }}
          onCancel={() => setShowEditor(false)}
        />
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id} className="p-4 bg-slate-800 border-slate-700">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="sm" onClick={() => moveLesson(index, 'up')} disabled={index === 0}>
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => moveLesson(index, 'down')} disabled={index === lessons.length - 1}>
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{lesson.title}</h3>
                  <p className="text-sm text-gray-400">{lesson.lesson_id}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setEditingLesson(lesson); setShowEditor(true); }}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(lesson.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

