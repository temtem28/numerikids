import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import CursorAwareInput from './CursorAwareInput';


interface Answer {
  id?: string;
  answer_text: string;
  is_correct: boolean;
  display_order: number;
}

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

interface QuestionEditorProps {
  question: Question;
  questionIndex: number;
  quizId: string;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

export default function QuestionEditor({ question, questionIndex, quizId, onSave, onCancel }: QuestionEditorProps) {
  const [formData, setFormData] = useState<Question>(question);


  const addAnswer = () => {
    const newAnswer: Answer = {
      answer_text: '',
      is_correct: false,
      display_order: formData.answers.length
    };
    setFormData({ ...formData, answers: [...formData.answers, newAnswer] });
  };

  const updateAnswer = (index: number, field: keyof Answer, value: any) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setFormData({ ...formData, answers: newAnswers });
  };

  const deleteAnswer = (index: number) => {
    setFormData({ ...formData, answers: formData.answers.filter((_, i) => i !== index) });
  };

  const handleTypeChange = (type: string) => {
    let answers = formData.answers;
    if (type === 'true_false') {
      answers = [
        { answer_text: 'True', is_correct: false, display_order: 0 },
        { answer_text: 'False', is_correct: false, display_order: 1 }
      ];
    }
    setFormData({ ...formData, question_type: type as any, answers });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white">Question Type</Label>
        <Select value={formData.question_type} onValueChange={handleTypeChange}>
          <SelectTrigger className="bg-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="true_false">True/False</SelectItem>
            <SelectItem value="code_challenge">Code Challenge</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-white">Question Text</Label>
        <CursorAwareInput
          fieldId={`quiz-${quizId}-question-${questionIndex}-text`}
          value={formData.question_text}
          onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
          className="bg-slate-700 text-white"
          multiline
          rows={3}
        />
      </div>


      {formData.question_type === 'code_challenge' && (
        <div>
          <Label className="text-white">Code Template</Label>
          <CursorAwareInput
            fieldId={`quiz-${quizId}-question-${questionIndex}-code_template`}
            value={formData.code_template || ''}
            onChange={(e) => setFormData({ ...formData, code_template: e.target.value })}
            className="bg-slate-700 text-white font-mono"
            multiline
            rows={5}
          />
        </div>
      )}


      <div>
        <Label className="text-white">Explanation (shown after answering)</Label>
        <CursorAwareInput
          fieldId={`quiz-${quizId}-question-${questionIndex}-explanation`}
          value={formData.explanation || ''}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          className="bg-slate-700 text-white"
          multiline
          rows={2}
        />
      </div>


      <div>
        <Label className="text-white">Points</Label>
        <Input
          type="number"
          value={formData.points}
          onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
          className="bg-slate-700 text-white"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="text-white">Answers</Label>
          {formData.question_type !== 'true_false' && (
            <Button size="sm" onClick={addAnswer}>
              <Plus className="w-4 h-4 mr-1" />Add Answer
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {formData.answers.map((answer, index) => (
            <div key={index} className="flex items-center space-x-2 bg-slate-700 p-2 rounded">
              <CursorAwareInput
                fieldId={`quiz-${quizId}-question-${questionIndex}-answer-${index}`}
                value={answer.answer_text}
                onChange={(e) => updateAnswer(index, 'answer_text', e.target.value)}
                className="flex-1 bg-slate-600 text-white"
                placeholder="Answer text"
                disabled={formData.question_type === 'true_false'}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  checked={answer.is_correct}
                  onCheckedChange={(checked) => updateAnswer(index, 'is_correct', checked)}
                />
                <Label className="text-white text-xs">Correct</Label>
              </div>
              {formData.question_type !== 'true_false' && (
                <Button size="sm" variant="ghost" onClick={() => deleteAnswer(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)}>Save Question</Button>
      </div>
    </div>
  );
}