import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const PRESET_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What is your favorite book?",
  "What was your childhood nickname?",
  "What street did you grow up on?",
  "What is your favorite movie?",
];

export default function SecurityQuestionsSetup() {
  const [questions, setQuestions] = useState([
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (questions.some(q => !q.question || !q.answer)) {
      toast.error('Please fill in all questions and answers');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('account-security', {
        body: { action: 'setSecurityQuestions', questions }
      });

      if (error) throw error;
      toast.success('Security questions saved successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Questions</CardTitle>
        <CardDescription>
          Set up security questions to help recover your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, idx) => (
            <div key={idx} className="space-y-3 p-4 border rounded-lg">
              <Label>Question {idx + 1}</Label>
              <Select
                value={q.question}
                onValueChange={(value) => {
                  const newQuestions = [...questions];
                  newQuestions[idx].question = value;
                  setQuestions(newQuestions);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a question" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_QUESTIONS.map((question) => (
                    <SelectItem key={question} value={question}>
                      {question}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder="Your answer"
                value={q.answer}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[idx].answer = e.target.value;
                  setQuestions(newQuestions);
                }}
              />
            </div>
          ))}
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Security Questions'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}