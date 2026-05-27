import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor, Tablet, Trash2, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TrustedDevice {
  id: string;
  device_id: string;
  device_name: string;
  created_at: string;
  expires_at: string;
  last_used_at: string;
}

export default function TrustedDeviceManager() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadDevices();
  }, [user]);

  const loadDevices = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('trusted_devices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) setDevices(data);
    setLoading(false);
  };

  const removeDevice = async (deviceId: string) => {
    const { error } = await supabase
      .from('trusted_devices')
      .delete()
      .eq('id', deviceId);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Appareil retiré');
      loadDevices();
    }
  };

  const getDeviceIcon = (name: string) => {
    if (name.toLowerCase().includes('mobile') || name.toLowerCase().includes('android') || name.toLowerCase().includes('iphone')) {
      return <Smartphone className="w-5 h-5" />;
    } else if (name.toLowerCase().includes('tablet') || name.toLowerCase().includes('ipad')) {
      return <Tablet className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  if (loading) return <div className="text-slate-400">Chargement...</div>;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Shield className="w-5 h-5 text-cyan-400" />
          Appareils de confiance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {devices.length === 0 ? (
          <p className="text-slate-400 text-sm">Aucun appareil de confiance</p>
        ) : (
          devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="text-cyan-400">
                  {getDeviceIcon(device.device_name)}
                </div>
                <div>
                  <p className="text-white font-medium">{device.device_name}</p>
                  <p className="text-slate-400 text-xs">
                    Expire le {new Date(device.expires_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDevice(device.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
