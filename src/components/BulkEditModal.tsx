import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface BulkEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (updates: any) => Promise<void>;
  selectedCount: number;
}

const avatars = [
  '/lovable-uploads/wizard1.png',
  '/lovable-uploads/wizard2.png',
  '/lovable-uploads/wizard3.png',
  '/lovable-uploads/wizard4.png'
];

const BulkEditModal: React.FC<BulkEditModalProps> = ({ open, onClose, onSave, selectedCount }) => {
  const [birthYear, setBirthYear] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const updates: any = {};
    if (birthYear) updates.birth_year = parseInt(birthYear);
    if (avatar) updates.avatar_url = avatar;
    
    await onSave(updates);
    setLoading(false);
    setBirthYear('');
    setAvatar('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-cyan-500/20">
        <DialogHeader>
          <DialogTitle className="text-white">
            Modifier {selectedCount} enfant(s)
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-slate-300">Année de naissance (optionnel)</Label>
            <Input
              type="number"
              min="2000"
              max={new Date().getFullYear()}
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              placeholder="Laisser vide pour ne pas modifier"
            />
          </div>

          <div>
            <Label className="text-slate-300">Avatar (optionnel)</Label>
            <Select value={avatar} onValueChange={setAvatar}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Laisser vide pour ne pas modifier" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {avatars.map((av, idx) => (
                  <SelectItem key={idx} value={av}>Avatar {idx + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="bg-slate-800 text-white">
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-cyan-500 to-purple-500">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Appliquer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkEditModal;
