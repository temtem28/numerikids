import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserPlus, Trash2, Key, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ChildPinSetup } from '@/components/ChildPinSetup';

interface Child {
  id: string;
  name: string;
  age: number;
  grade_level: string;
  avatar_url?: string;
  pincode?: string | null;
}

interface ChildManagementPanelProps {
  children: Child[];
  onChildAdded: () => void;
  onChildRemoved: () => void;
}

export default function ChildManagementPanel({ children, onChildAdded, onChildRemoved }: ChildManagementPanelProps) {
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemoveChild = async (childId: string) => {
    setRemoving(childId);
    try {
      const { error } = await supabase
        .from('children')
        .update({ is_active: false })
        .eq('id', childId);

      if (error) throw error;
      toast.success('Profil enfant désactivé');
      onChildRemoved();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span>Profils des enfants</span>
          <Button onClick={onChildAdded} size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
            <UserPlus className="w-4 h-4 mr-2" />
            Ajouter un enfant
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {children.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>Aucun enfant ajouté</p>
              <p className="text-sm mt-1">Cliquez sur "Ajouter un enfant" pour commencer</p>
            </div>
          ) : (
            children.map(child => (
              <div key={child.id} className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {child.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">{child.name}</p>
                    <div className="flex gap-2 text-sm mt-1">
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">{child.age} ans</Badge>
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">{child.grade_level}</Badge>
                      {child.pincode ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <Key className="w-3 h-3 mr-1" />
                          PIN actif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-600 text-slate-400">
                          Pas de PIN
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ChildPinSetup 
                    child={{ 
                      id: child.id, 
                      name: child.name, 
                      avatar_url: child.avatar_url || null,
                      pincode: child.pincode 
                    }} 
                    onPinSet={onChildRemoved} 
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={removing === child.id} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-900 border-slate-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Supprimer le profil ?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                          Cette action va désactiver le profil de {child.name}. Sa progression sera conservée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleRemoveChild(child.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Student Login Info */}
        <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <h4 className="font-medium text-cyan-400 mb-2 flex items-center gap-2">
            <Key className="w-4 h-4" />
            Connexion Élève
          </h4>
          <p className="text-sm text-slate-400 mb-3">
            Une fois le code PIN configuré, vos enfants peuvent se connecter de manière autonome via la page de connexion élève.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => window.open('/login-student', '_blank')}
          >
            Voir la page de connexion élève
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
