import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ContentBlockEditor from './ContentBlockEditor';
import ContentVariantManager from './ContentVariantManager';
import { supabase } from '@/lib/supabase';
import { Sparkles, Target, TrendingUp, Eye, Layers } from 'lucide-react';

export default function PersonalizationDashboard() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalBlocks: 0,
    activeVariants: 0,
    avgEngagement: 0,
    personalizedEmails: 0
  });

  useEffect(() => {
    loadBlocks();
    loadStats();
  }, []);

  const loadBlocks = async () => {
    const { data } = await supabase
      .from('content_blocks')
      .select('*, content_variants(count)')
      .order('created_at', { ascending: false });
    setBlocks(data || []);
  };

  const loadStats = async () => {
    const { data: blocksData } = await supabase
      .from('content_blocks')
      .select('id', { count: 'exact' });

    const { data: variantsData } = await supabase
      .from('content_variants')
      .select('id', { count: 'exact' })
      .eq('active', true);

    const { data: trackingData } = await supabase
      .from('personalization_tracking')
      .select('engagement_score');

    const avgEngagement = trackingData?.length
      ? trackingData.reduce((sum, t) => sum + (t.engagement_score || 0), 0) / trackingData.length
      : 0;

    setStats({
      totalBlocks: blocksData?.length || 0,
      activeVariants: variantsData?.length || 0,
      avgEngagement: Math.round(avgEngagement * 100),
      personalizedEmails: trackingData?.length || 0
    });
  };

  const handleSaveBlock = async (block: any) => {
    await supabase.from('content_blocks').insert(block);
    loadBlocks();
    loadStats();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-500" />
            Content Personalization Engine
          </h2>
          <p className="text-muted-foreground">
            Create dynamic content that adapts to each recipient
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Layers className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalBlocks}</p>
                <p className="text-sm text-muted-foreground">Content Blocks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Target className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeVariants}</p>
                <p className="text-sm text-muted-foreground">Active Variants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.avgEngagement}%</p>
                <p className="text-sm text-muted-foreground">Avg Engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Eye className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.personalizedEmails}</p>
                <p className="text-sm text-muted-foreground">Personalized</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="blocks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="blocks">Content Blocks</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="space-y-4">
          <div className="grid gap-4">
            {blocks.map((block) => (
              <Card key={block.id} className="cursor-pointer hover:border-primary" onClick={() => setSelectedBlock(block.id)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{block.name}</h3>
                        <Badge>{block.block_type}</Badge>
                        <Badge variant="outline">{block.category}</Badge>
                        {block.personalization_enabled && (
                          <Badge variant="secondary">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Personalized
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{block.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedBlock && (
            <ContentVariantManager blockId={selectedBlock} />
          )}
        </TabsContent>

        <TabsContent value="create">
          <ContentBlockEditor onSave={handleSaveBlock} />
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed performance metrics coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}