import React, { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, Image, Video, Music } from 'lucide-react';
import { toast } from 'sonner';

interface MediaUploaderProps {
  onUploadComplete?: (url: string, type: string) => void;
}

export default function MediaUploader({ onUploadComplete }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = async (file: File) => {
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const type = file.type.split('/')[0];
    setFileType(type);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const { data, error } = await supabase.storage
        .from('lesson-media')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('lesson-media')
        .getPublicUrl(fileName);

      // Process with edge function
      await supabase.functions.invoke('media-processor', {
        body: { fileName, fileType: type }
      });

      toast.success('File uploaded successfully!');
      onUploadComplete?.(publicUrl, type);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <Card className={`p-8 border-2 border-dashed transition-colors ${
      dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300'
    }`}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className="text-center"
      >
        {preview ? (
          <div className="relative">
            {fileType === 'image' && <img src={preview} className="max-h-48 mx-auto rounded" />}
            {fileType === 'video' && <video src={preview} className="max-h-48 mx-auto rounded" controls />}
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={() => setPreview(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
            <p className="text-sm text-slate-500 mb-4">Supports images, videos, and audio files</p>
          </>
        )}
        
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleChange}
          accept="image/*,video/*,audio/*"
          disabled={uploading}
        />
        <Button asChild disabled={uploading}>
          <label htmlFor="file-upload" className="cursor-pointer">
            {uploading ? 'Uploading...' : 'Select File'}
          </label>
        </Button>
      </div>
    </Card>
  );
}
