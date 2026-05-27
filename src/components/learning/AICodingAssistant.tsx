import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, X, Loader2, Lightbulb, Bug } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PixelWizardAvatar } from './PixelWizardAvatar';
import { getPixelKingdomResponse } from '@/utils/pixelKingdomAssistant';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AICodingAssistantProps {
  lessonContext?: {
    title: string;
    description: string;
    questId?: number;
    isPixelKingdom?: boolean;
  };
  exerciseType: 'python' | 'scratch';
  currentCode?: string;
  isOpen: boolean;
  onClose: () => void;
}


export function AICodingAssistant({
  lessonContext,
  exerciseType,
  currentCode,
  isOpen,
  onClose
}: AICodingAssistantProps) {
  const isPixelKingdom = lessonContext?.isPixelKingdom || false;
  const initialMessage = isPixelKingdom
    ? "🧙‍♂️ Salutations, jeune apprenti! Je suis Merlin le Sage, gardien du Royaume des Pixels. Pose-moi tes questions sur la magie du code!"
    : "Salut! Je suis ton assistant de code. Pose-moi des questions si tu es bloqué!";

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Quick hint buttons for Pixel Kingdom
  const getQuickHints = () => {
    if (!isPixelKingdom || !lessonContext?.questId) return [];
    
    const questId = lessonContext.questId;
    if (questId <= 3) return ["Comment fonctionnent les pixels?", "C'est quoi RGB?", "J'ai une erreur"];
    if (questId <= 6) return ["Comment faire une boucle?", "Aide pour le debug", "Stratégie boss"];
    if (questId <= 9) return ["Les variables?", "Les conditions?", "Aide générale"];
    return ["La récursion?", "Les fonctions?", "Besoin d'aide"];
  };


  const sendMessage = async (messageText?: string) => {
    const questionToSend = messageText || input.trim();
    if (!questionToSend || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: questionToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // For Pixel Kingdom, use local response system first
      if (isPixelKingdom && lessonContext?.questId) {
        const localResponse = getPixelKingdomResponse(
          lessonContext.questId,
          questionToSend,
          currentCode
        );
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: localResponse,
            timestamp: new Date()
          }]);
          setIsLoading(false);
        }, 800);
        return;
      }

      // Track AI help request
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ai_help_requests').insert({
          child_id: user.id,
          lesson_id: lessonContext?.title || 'unknown',
          exercise_type: exerciseType,
          question: questionToSend,
          topic: lessonContext?.title || 'General'
        });
      }

      const { data, error } = await supabase.functions.invoke('ai-coding-assistant', {
        body: { message: questionToSend, lessonContext, exerciseType, currentCode }
      });

      if (error) throw error;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Désolé, j'ai un problème technique. Réessaie!",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };



  if (!isOpen) return null;

  const quickHints = getQuickHints();
  const headerColor = isPixelKingdom 
    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700'
    : 'bg-gradient-to-r from-purple-600 to-blue-600';

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] shadow-2xl border-2 border-purple-500 flex flex-col z-50">
      <div className={`${headerColor} p-4 flex items-center justify-between rounded-t-lg`}>
        <div className="flex items-center gap-2 text-white">
          {isPixelKingdom ? (
            <>
              <PixelWizardAvatar isThinking={isLoading} />
              <span className="font-bold">Merlin le Sage</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">Assistant IA</span>
            </>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && isPixelKingdom && (
                <PixelWizardAvatar />
              )}
              <div className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : isPixelKingdom ? 'bg-purple-50 text-gray-900 border border-purple-200' : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 justify-start">
              {isPixelKingdom && <PixelWizardAvatar isThinking />}
              <div className="bg-gray-100 p-3 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {quickHints.length > 0 && (
        <div className="px-4 py-2 border-t bg-purple-50">
          <div className="flex gap-2 flex-wrap">
            {quickHints.map((hint, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(hint)}
                className="text-xs"
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                {hint}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={isPixelKingdom ? "Demande conseil à Merlin..." : "Pose ta question..."}
            disabled={isLoading}
          />
          <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
