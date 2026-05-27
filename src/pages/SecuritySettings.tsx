import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import SecurityQuestionsSetup from '@/components/security/SecurityQuestionsSetup';
import AlternativeEmailManager from '@/components/security/AlternativeEmailManager';
import LoginHistoryView from '@/components/security/LoginHistoryView';
import ActiveSessionsManager from '@/components/security/ActiveSessionsManager';
import SuspiciousActivityPanel from '@/components/security/SuspiciousActivityPanel';
import TwoFactorManager from '@/components/security/TwoFactorManager';
import TrustedDeviceManager from '@/components/security/TrustedDeviceManager';
import SessionPreferences from '@/components/security/SessionPreferences';
import LoginAlerts from '@/components/security/LoginAlerts';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Mail, History, Monitor, AlertTriangle, Lock, Smartphone, Settings, Bell, LayoutDashboard, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function SecuritySettings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Paramètres de sécurité" subtitle="Gérez la sécurité de votre compte">
      <div className="p-6 max-w-6xl mx-auto">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 bg-slate-900/50 border border-cyan-500/20 p-2 rounded-lg">
            <TabsTrigger value="overview" className="gap-1 text-xs"><LayoutDashboard className="h-4 w-4" /><span className="hidden sm:inline">Aperçu</span></TabsTrigger>
            <TabsTrigger value="sessions" className="gap-1 text-xs"><Monitor className="h-4 w-4" /><span className="hidden sm:inline">Sessions</span></TabsTrigger>
            <TabsTrigger value="preferences" className="gap-1 text-xs"><Settings className="h-4 w-4" /><span className="hidden sm:inline">Préférences</span></TabsTrigger>
            <TabsTrigger value="alerts" className="gap-1 text-xs"><Bell className="h-4 w-4" /><span className="hidden sm:inline">Alertes</span></TabsTrigger>
            <TabsTrigger value="2fa" className="gap-1 text-xs"><Lock className="h-4 w-4" /><span className="hidden sm:inline">2FA</span></TabsTrigger>
            <TabsTrigger value="devices" className="gap-1 text-xs"><Smartphone className="h-4 w-4" /><span className="hidden sm:inline">Appareils</span></TabsTrigger>
            <TabsTrigger value="questions" className="gap-1 text-xs"><Shield className="h-4 w-4" /><span className="hidden sm:inline">Questions</span></TabsTrigger>
            <TabsTrigger value="emails" className="gap-1 text-xs"><Mail className="h-4 w-4" /><span className="hidden sm:inline">Emails</span></TabsTrigger>
            <TabsTrigger value="history" className="gap-1 text-xs"><History className="h-4 w-4" /><span className="hidden sm:inline">Historique</span></TabsTrigger>
            <TabsTrigger value="suspicious" className="gap-1 text-xs"><AlertTriangle className="h-4 w-4" /><span className="hidden sm:inline">Suspect</span></TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><SecurityDashboard /></TabsContent>
          <TabsContent value="sessions"><ActiveSessionsManager /></TabsContent>
          <TabsContent value="preferences"><SessionPreferences /></TabsContent>
          <TabsContent value="alerts"><LoginAlerts /></TabsContent>
          <TabsContent value="2fa">{user && <TwoFactorManager userId={user.id} />}</TabsContent>
          <TabsContent value="devices"><TrustedDeviceManager /></TabsContent>
          <TabsContent value="questions"><SecurityQuestionsSetup /></TabsContent>
          <TabsContent value="emails"><AlternativeEmailManager /></TabsContent>
          <TabsContent value="history"><LoginHistoryView /></TabsContent>
          <TabsContent value="suspicious"><SuspiciousActivityPanel /></TabsContent>
        </Tabs>

        <div className="mt-8 p-6 border border-red-500/30 bg-red-500/10 rounded-lg">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Zone de danger</h3>
          <p className="text-sm text-red-300 mb-4">
            Supprimez définitivement votre compte et toutes les données associées. Cette action est irréversible.
          </p>
          <Button
            variant="destructive"
            onClick={() => navigate('/delete-account')}
            className="gap-2 bg-red-500 hover:bg-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer le compte
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
