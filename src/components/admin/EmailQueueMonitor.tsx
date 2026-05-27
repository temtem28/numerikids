import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, RefreshCw, AlertCircle, CheckCircle, Clock, Search, Play } from 'lucide-react';
import { toast } from 'sonner';

interface EmailQueueItem {
  id: string;
  user_id: string;
  email_type: string;
  recipient_email: string;
  subject: string;
  status: string;
  scheduled_for: string;
  sent_at: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
}

interface QueueStats {
  pending: number;
  sent: number;
  failed: number;
  total: number;
}

export default function EmailQueueMonitor() {
  const [emails, setEmails] = useState<EmailQueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats>({ pending: 0, sent: 0, failed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadEmailQueue();
    loadStats();
    
    const interval = setInterval(() => {
      loadEmailQueue();
      loadStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [filter, search]);

  const loadEmailQueue = async () => {
    try {
      let query = supabase
        .from('email_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      if (search) {
        query = query.or(`recipient_email.ilike.%${search}%,subject.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEmails(data || []);
    } catch (error: any) {
      toast.error('Failed to load email queue');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('email_queue')
        .select('status');

      if (error) throw error;

      const stats = (data || []).reduce((acc, item) => {
        acc.total++;
        if (item.status === 'pending') acc.pending++;
        else if (item.status === 'sent') acc.sent++;
        else if (item.status === 'failed') acc.failed++;
        return acc;
      }, { pending: 0, sent: 0, failed: 0, total: 0 });

      setStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const retryEmail = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('email_queue')
        .update({ status: 'pending', error_message: null })
        .eq('id', emailId);

      if (error) throw error;
      toast.success('Email queued for retry');
      loadEmailQueue();
      loadStats();
    } catch (error: any) {
      toast.error('Failed to retry email');
    }
  };

  const processQueue = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('process-email-queue');
      if (error) throw error;
      toast.success('Email queue processing started');
      setTimeout(() => {
        loadEmailQueue();
        loadStats();
      }, 2000);
    } catch (error: any) {
      toast.error('Failed to process queue: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/20"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-500/20"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.sent}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Queue
            </CardTitle>
            <Button onClick={processQueue} disabled={processing}>
              <Play className="w-4 h-4 mr-2" />
              Process Queue Now
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by email or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadEmailQueue}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : emails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">No emails found</TableCell>
                  </TableRow>
                ) : (
                  emails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.recipient_email}</TableCell>
                      <TableCell>{email.subject}</TableCell>
                      <TableCell>{email.email_type}</TableCell>
                      <TableCell>{getStatusBadge(email.status)}</TableCell>
                      <TableCell>{new Date(email.scheduled_for).toLocaleString()}</TableCell>
                      <TableCell>
                        {email.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retryEmail(email.id)}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
