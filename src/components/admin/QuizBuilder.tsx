import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical, Eye } from 'lucide-react';
import QuestionEditor from './QuestionEditor';
import QuizPreview from './QuizPreview';
import CursorAwareInput from './CursorAwareInput';


interface Question {
  id?: string;
  question_type: 'multiple_choice' | 'true_false' | 'code_challenge';
  question_text: string;
  code_template?: string;
  explanation?: string;
  points: number;
  display_order: number;
  answers: Answer[];
}

interface Answer {
  id?: string;
  answer_text: string;
  is_correct: boolean;
  display_order: number;
}

interface QuizBuilderProps {
  quiz: any;
  onSave: (quiz: any) => void;
  onCancel: () => void;
}

export default function QuizBuilder({ quiz, onSave, onCancel }: QuizBuilderProps) {
  const [formData, setFormData] = useState({
    title: quiz?.title || '',
    description: quiz?.description || '',
    lesson_id: quiz?.lesson_id || '',
    time_limit: quiz?.time_limit || null,
    passing_score: quiz?.passing_score || 70,
    is_published: quiz?.is_published || false,
  });

  const [questions, setQuestions] = useState<Question[]>(quiz?.questions || []);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      question_type: 'multiple_choice',
      question_text: '',
      points: 10,
      display_order: questions.length,
      answers: []
    };
    setQuestions([...questions, newQuestion]);
    setEditingQuestion(questions.length);
  };

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) return;
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    newQuestions.forEach((q, i) => q.display_order = i);
    setQuestions(newQuestions);
  };

  const handleSave = () => {
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    onSave({ ...formData, questions, total_points: totalPoints });
  };

  if (showPreview) {
    return <QuizPreview quiz={{ ...formData, questions }} onClose={() => setShowPreview(false)} />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Quiz Details</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-white">Title</Label>
            <CursorAwareInput 
              fieldId={`quiz-${quiz?.id || 'new'}-title`}
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className="bg-slate-700 text-white" 
            />
          </div>
          <div>
            <Label className="text-white">Description</Label>
            <CursorAwareInput 
              fieldId={`quiz-${quiz?.id || 'new'}-description`}
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="bg-slate-700 text-white"
              multiline
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Lesson ID</Label>
              <Input value={formData.lesson_id} onChange={(e) => setFormData({...formData, lesson_id: e.target.value})} className="bg-slate-700 text-white" />
            </div>
            <div>
              <Label className="text-white">Time Limit (seconds)</Label>
              <Input type="number" value={formData.time_limit || ''} onChange={(e) => setFormData({...formData, time_limit: e.target.value ? parseInt(e.target.value) : null})} className="bg-slate-700 text-white" />
            </div>
            <div>
              <Label className="text-white">Passing Score (%)</Label>
              <Input type="number" value={formData.passing_score} onChange={(e) => setFormData({...formData, passing_score: parseInt(e.target.value)})} className="bg-slate-700 text-white" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={formData.is_published} onCheckedChange={(checked) => setFormData({...formData, is_published: checked})} />
            <Label className="text-white">Published</Label>
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Questions ({questions.length})</h3>
        <div className="space-x-2">
          <Button onClick={() => setShowPreview(true)} variant="outline"><Eye className="w-4 h-4 mr-2" />Preview</Button>
          <Button onClick={addQuestion}><Plus className="w-4 h-4 mr-2" />Add Question</Button>
        </div>
      </div>

      {questions.map((question, index) => (
        <Card key={index} className="p-4 bg-slate-800 border-slate-700">
          {editingQuestion === index ? (
            <QuestionEditor question={question} questionIndex={index} quizId={quiz?.id || 'new'} onSave={(q) => { updateQuestion(index, q); setEditingQuestion(null); }} onCancel={() => setEditingQuestion(null)} />

          ) : (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-bold text-purple-400">Q{index + 1}</span>
                  <span className="text-xs px-2 py-1 bg-purple-600 text-white rounded">{question.question_type.replace('_', ' ')}</span>
                  <span className="text-xs text-gray-400">{question.points} pts</span>
                </div>
                <p className="text-white">{question.question_text || 'Empty question'}</p>
                <p className="text-sm text-gray-400 mt-1">{question.answers.length} answers</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="ghost" onClick={() => moveQuestion(index, 'up')} disabled={index === 0}><GripVertical className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => moveQuestion(index, 'down')} disabled={index === questions.length - 1}><GripVertical className="w-4 h-4" /></Button>
                <Button size="sm" onClick={() => setEditingQuestion(index)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => deleteQuestion(index)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </Card>
      ))}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save Quiz</Button>
      </div>
    </div>
  );
}