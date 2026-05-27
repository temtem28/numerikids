import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Copy, TrendingUp, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function SubjectLineLibrary() {
  const [subjectLines, setSubjectLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadSubjectLines();
  }, [categoryFilter]);

  const loadSubjectLines = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('subject_lines')
        .select('*')
        .order('performance_score', { ascending: false });

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSubjectLines(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Subject line copied to clipboard' });
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredLines = subjectLines.filter(line =>
    line.subject_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subject lines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="educational">Educational</SelectItem>
            <SelectItem value="promotional">Promotional</SelectItem>
            <SelectItem value="reminder">Reminder</SelectItem>
            <SelectItem value="milestone">Milestone</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredLines.map((line) => (
          <Card key={line.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium">{line.subject_text}</p>
                  {line.generated_by_ai && (
                    <Badge variant="outline" className="text-xs">AI</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="capitalize">{line.category}</span>
                  <span className="capitalize">{line.tone}</span>
                  {line.total_sent > 0 && (
                    <>
                      <span>{line.open_rate}% open rate</span>
                      <span>{line.total_sent} sends</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <Badge className={getPerformanceColor(line.performance_score)}>
                  <Star className="w-3 h-3 mr-1" />
                  {line.performance_score}/100
                </Badge>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(line.subject_text)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredLines.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No subject lines found</p>
        </div>
      )}
    </div>
  );
}
