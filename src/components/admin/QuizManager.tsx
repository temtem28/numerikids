import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import QuizBuilder from './QuizBuilder';

export default function QuizManager() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('quiz-manager', {
        body: { action: 'list_quizzes' }
      });

      if (error) throw error;
      setQuizzes(data.data || []);
    } catch (error: any) {
      toast.error('Failed to load quizzes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async (quizData: any) => {
    try {
      const action = editingQuiz ? 'update_quiz' : 'create_quiz';
      const body: any = { action, quiz: quizData };
      
      if (editingQuiz) {
        body.quizId = editingQuiz.id;
      }

      const { data, error } = await supabase.functions.invoke('quiz-manager', { body });

      if (error) throw error;

      const savedQuiz = data.data;

      // Save questions and answers
      if (quizData.questions) {
        for (const question of quizData.questions) {
          const questionBody: any = {
            action: question.id ? 'update_question' : 'create_question',
            question: {
              ...question,
              quiz_id: savedQuiz.id
            }
          };

          if (question.id) {
            questionBody.questionId = question.id;
          }

          const { data: questionData } = await supabase.functions.invoke('quiz-manager', { body: questionBody });
          const savedQuestion = questionData.data;

          // Save answers
          for (const answer of question.answers) {
            const answerBody = {
              action: answer.id ? 'update_answer' : 'create_answer',
              answer: {
                ...answer,
                question_id: savedQuestion.id
              }
            };

            await supabase.functions.invoke('quiz-manager', { body: answerBody });
          }
        }
      }

      toast.success(editingQuiz ? 'Quiz updated!' : 'Quiz created!');
      setEditingQuiz(null);
      setIsCreating(false);
      loadQuizzes();
    } catch (error: any) {
      toast.error('Failed to save quiz: ' + error.message);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const { error } = await supabase.functions.invoke('quiz-manager', {
        body: { action: 'delete_quiz', quizId }
      });

      if (error) throw error;
      toast.success('Quiz deleted!');
      loadQuizzes();
    } catch (error: any) {
      toast.error('Failed to delete quiz: ' + error.message);
    }
  };

  const handleEditQuiz = async (quiz: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('quiz-manager', {
        body: { action: 'get_quiz', quizId: quiz.id }
      });

      if (error) throw error;
      setEditingQuiz(data.data);
    } catch (error: any) {
      toast.error('Failed to load quiz: ' + error.message);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.lesson_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isCreating || editingQuiz) {
    return (
      <QuizBuilder
        quiz={editingQuiz}
        onSave={handleSaveQuiz}
        onCancel={() => { setIsCreating(false); setEditingQuiz(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-slate-800 border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Quiz Manager</h2>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />Create Quiz
          </Button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700 text-white border-slate-600"
          />
        </div>

        {loading ? (
          <p className="text-gray-400">Loading quizzes...</p>
        ) : filteredQuizzes.length === 0 ? (
          <p className="text-gray-400">No quizzes found. Create your first quiz!</p>
        ) : (
          <div className="space-y-3">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="p-4 bg-slate-700 border-slate-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
                      {quiz.is_published && (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Published</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{quiz.description}</p>
                    <div className="flex space-x-4 text-xs text-gray-500">
                      <span>Lesson: {quiz.lesson_id || 'None'}</span>
                      <span>Time: {quiz.time_limit ? `${quiz.time_limit}s` : 'No limit'}</span>
                      <span>Passing: {quiz.passing_score}%</span>
                      <span>Points: {quiz.total_points}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditQuiz(quiz)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteQuiz(quiz.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}