import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Mail, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function AlternativeEmailManager() {
  const [emails, setEmails] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('account-security', {
        body: { action: 'getAlternativeEmails' }
      });

      if (error) throw error;
      setEmails(data.emails || []);
    } catch (error: any) {
      console.error('Error loading emails:', error);
    }
  };

  const addEmail = async () => {
    if (!newEmail) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase.functions.invoke('account-security', {
        body: { action: 'addAlternativeEmail', email: newEmail }
      });

      if (error) throw error;
      toast.success('Alternative email added');
      setNewEmail('');
      loadEmails();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeEmail = async (emailId: string) => {
    try {
      const { error } = await supabase.functions.invoke('account-security', {
        body: { action: 'removeAlternativeEmail', emailId }
      });

      if (error) throw error;
      toast.success('Email removed');
      loadEmails();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alternative Email Addresses</CardTitle>
        <CardDescription>
          Add backup emails for account recovery
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="backup@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Button onClick={addEmail} disabled={loading}>
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {emails.map((email) => (
            <div key={email.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{email.email}</span>
                {email.verified ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Unverified
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeEmail(email.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}