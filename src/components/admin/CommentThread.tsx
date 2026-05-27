import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Check } from 'lucide-react';

interface Comment {
  id: string;
  user_email: string;
  user_name?: string;
  comment_text: string;
  created_at: string;
  is_resolved: boolean;
}

interface CommentThreadProps {
  questId: string;
  targetType: string;
  targetId: string;
  currentUserId: string;
  currentUserEmail: string;
  currentUserName?: string;
}

export function CommentThread({ questId, targetType, targetId, currentUserId, currentUserEmail, currentUserName }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const fetchComments = async () => {
    const { data } = await supabase.functions.invoke('saga-collaboration', {
      body: { action: 'getComments', commentData: { targetType, targetId } }
    });
    if (data?.success) setComments(data.data);
  };

  useEffect(() => {
    if (isOpen) fetchComments();
    const channel = supabase.channel(`comments-${targetId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saga_comments', filter: `target_id=eq.${targetId}` }, fetchComments)
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [isOpen, targetId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await supabase.functions.invoke('saga-collaboration', {
      body: { action: 'addComment', questId, userId: currentUserId, userEmail: currentUserEmail, userName: currentUserName, commentData: { targetType, targetId, text: newComment } }
    });
    setNewComment('');
    fetchComments();
  };

  const unresolvedCount = comments.filter(c => !c.is_resolved).length;

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative">
        <MessageSquare className="w-4 h-4" />
        {unresolvedCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">{unresolvedCount}</Badge>}
      </Button>
      {isOpen && (
        <Card className="absolute right-0 top-10 w-80 p-4 z-50 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {comments.map(c => (
              <div key={c.id} className={`p-2 rounded ${c.is_resolved ? 'bg-gray-50' : 'bg-white border'}`}>
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm">{c.user_name || c.user_email.split('@')[0]}</span>
                  {c.is_resolved && <Check className="w-4 h-4 text-green-600" />}
                </div>
                <p className="text-sm mt-1">{c.comment_text}</p>
                <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</span>
              </div>
            ))}
            <Textarea placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={2} />
            <Button onClick={handleAddComment} size="sm" className="w-full">Post Comment</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
