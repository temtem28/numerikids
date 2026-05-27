import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Video, Music, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface MediaFile {
  name: string;
  url: string;
  type: string;
  created_at: string;
}

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
}

export default function MediaLibrary({ onSelect }: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from('lesson-media')
      .list();

    if (data) {
      const filesWithUrls = data.map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from('lesson-media')
          .getPublicUrl(file.name);
        
        const ext = file.name.split('.').pop()?.toLowerCase();
        let type = 'other';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) type = 'image';
        if (['mp4', 'webm', 'mov'].includes(ext || '')) type = 'video';
        if (['mp3', 'wav', 'ogg'].includes(ext || '')) type = 'audio';

        return {
          name: file.name,
          url: publicUrl,
          type,
          created_at: file.created_at
        };
      });
      setFiles(filesWithUrls);
    }
    setLoading(false);
  };

  const deleteFile = async (fileName: string) => {
    const { error } = await supabase.storage
      .from('lesson-media')
      .remove([fileName]);

    if (!error) {
      toast.success('File deleted');
      loadFiles();
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || file.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={filter} onValueChange={(v: any) => setFilter(v)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {filteredFiles.map(file => (
          <Card key={file.name} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div onClick={() => onSelect?.(file.url)}>
              {file.type === 'image' && (
                <img src={file.url} className="w-full h-32 object-cover rounded mb-2" />
              )}
              {file.type === 'video' && (
                <div className="w-full h-32 bg-slate-200 rounded mb-2 flex items-center justify-center">
                  <Video className="w-8 h-8 text-slate-400" />
                </div>
              )}
              {file.type === 'audio' && (
                <div className="w-full h-32 bg-slate-200 rounded mb-2 flex items-center justify-center">
                  <Music className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <p className="text-xs truncate">{file.name}</p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="w-full mt-2"
              onClick={() => deleteFile(file.name)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
