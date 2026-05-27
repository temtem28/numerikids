import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload, Save, X, Image as ImageIcon, Video, Music } from 'lucide-react';
import CursorAwareInput from './CursorAwareInput';
import MediaPicker from './MediaPicker';
import { VideoTranscodingStatus } from './VideoTranscodingStatus';
import { SubtitleManager } from './SubtitleManager';



interface LessonEditorProps {
  lesson: any;
  onSave: () => void;
  onCancel: () => void;
}

export default function LessonEditor({ lesson, onSave, onCancel }: LessonEditorProps) {
  const [formData, setFormData] = useState({
    lesson_id: lesson?.lesson_id || '',
    saga_id: lesson?.saga_id || '',
    quest_number: lesson?.quest_number || 1,
    lesson_number: lesson?.lesson_number || 1,
    title: lesson?.title || '',
    description: lesson?.description || '',
    content: lesson?.content || {},
    video_url: lesson?.video_url || '',
    background_image: lesson?.background_image || '',
    audio_url: lesson?.audio_url || '',
    is_published: lesson?.is_published || false
  });
  const [uploading, setUploading] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerType, setMediaPickerType] = useState<'video' | 'image' | 'audio'>('image');


  const openMediaPicker = (type: 'video' | 'image' | 'audio') => {
    setMediaPickerType(type);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaPickerType === 'video') {
      setFormData({...formData, video_url: url});
    } else if (mediaPickerType === 'image') {
      setFormData({...formData, background_image: url});
    } else if (mediaPickerType === 'audio') {
      setFormData({...formData, audio_url: url});
    }
  };

  const handleSave = async () => {
    const action = lesson ? 'update' : 'create';
    const body: any = { action, lessonData: formData };
    if (lesson) body.lessonId = lesson.id;

    await supabase.functions.invoke('admin-lesson-manager', { body });
    onSave();
  };


  return (
    <>
      <Card className="p-6 bg-slate-800 border-slate-700">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              {lesson ? 'Edit Lesson' : 'New Lesson'}
            </h3>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Lesson ID</Label>
              <CursorAwareInput 
                fieldId={`lesson-${formData.saga_id}-${formData.lesson_id || 'new'}-lesson_id`}
                value={formData.lesson_id} 
                onChange={e => setFormData({...formData, lesson_id: e.target.value})} 
              />
            </div>
            <div>
              <Label className="text-white">Saga ID</Label>
              <CursorAwareInput 
                fieldId={`lesson-${formData.saga_id}-${formData.lesson_id || 'new'}-saga_id`}
                value={formData.saga_id} 
                onChange={e => setFormData({...formData, saga_id: e.target.value})} 
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Title</Label>
            <CursorAwareInput 
              fieldId={`lesson-${formData.saga_id}-${formData.lesson_id || 'new'}-title`}
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>

          <div>
            <Label className="text-white">Description</Label>
            <CursorAwareInput 
              fieldId={`lesson-${formData.saga_id}-${formData.lesson_id || 'new'}-description`}
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              multiline
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-white">Media Attachments</Label>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => openMediaPicker('video')}
                >
                  <Video className="w-4 h-4 mr-2" /> Video
                </Button>
                {formData.video_url && (
                  <p className="text-xs text-green-400 mt-1 truncate">✓ Attached</p>
                )}
              </div>

              <div>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => openMediaPicker('image')}
                >
                  <ImageIcon className="w-4 h-4 mr-2" /> Image
                </Button>
                {formData.background_image && (
                  <p className="text-xs text-green-400 mt-1 truncate">✓ Attached</p>
                )}
              </div>

              <div>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => openMediaPicker('audio')}
                >
                  <Music className="w-4 h-4 mr-2" /> Audio
                </Button>
                {formData.audio_url && (
                  <p className="text-xs text-green-400 mt-1 truncate">✓ Attached</p>
                )}
              </div>
            </div>
          </div>

          {/* Video Transcoding Status */}
          {lesson?.id && formData.video_url && (
            <VideoTranscodingStatus 
              lessonId={lesson.id} 
              onTranscodingComplete={onSave}
            />
          )}

          {/* Subtitle Management */}
          {lesson?.id && formData.video_url && (
            <SubtitleManager 
              lessonId={lesson.id} 
              videoUrl={formData.video_url}
            />
          )}


          <div className="flex items-center gap-2">
            <Switch 
              checked={formData.is_published} 
              onCheckedChange={checked => setFormData({...formData, is_published: checked})}
            />
            <Label className="text-white">Published</Label>
          </div>


          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </div>
      </Card>

      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        title={`Select ${mediaPickerType.charAt(0).toUpperCase() + mediaPickerType.slice(1)}`}
      />
    </>
  );
}


