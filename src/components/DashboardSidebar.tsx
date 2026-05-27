import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  CreditCard, 
  Settings, 
  Shield, 
  Map, 
  Trophy, 
  Store, 
  Package,
  Gift,
  Rocket,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
  Gamepad2,
  LineChart,
  GitCompare,
  Target,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
  badgeColor?: string;
}

const mainNavItems: NavItem[] = [
  { icon: Home, label: 'Tableau de bord', path: '/dashboard' },
  { icon: Users, label: 'Mes enfants', path: '/household' },
  { icon: LineChart, label: 'Progression des enfants', path: '/analytics' },
  { icon: GitCompare, label: 'Comparer les progrès', path: '/comparison' },
  { icon: Target, label: 'Objectifs', path: '/goals', badge: 'Nouveau', badgeColor: 'bg-green-500' },
  { icon: FileText, label: 'Rapports', path: '/reports', badge: 'Nouveau', badgeColor: 'bg-purple-500' },
];


const learningNavItems: NavItem[] = [
  { icon: Map, label: 'Sagas', path: '/sagas' },
  { icon: Gamepad2, label: 'Pixel Kingdom', path: '/pixel-kingdom' },
  { icon: Trophy, label: 'Succès', path: '/achievements' },
];

const storeNavItems: NavItem[] = [
  { icon: Store, label: 'Boutique', path: '/store' },
  { icon: Package, label: 'Inventaire', path: '/inventory' },
  { icon: Gift, label: 'Parrainage', path: '/referrals' },
];

const settingsNavItems: NavItem[] = [
  { icon: CreditCard, label: 'Abonnement', path: '/billing' },
  { icon: Shield, label: 'Sécurité', path: '/security' },
  { icon: Settings, label: 'Paramètres', path: '/household' },
];


const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  collapsed = false, 
  onToggle 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ item }: { item: NavItem }) => (
    <button
      onClick={() => navigate(item.path)}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
        'hover:bg-cyan-500/10 group',
        isActive(item.path) 
          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30' 
          : 'text-slate-400 hover:text-cyan-300'
      )}
    >
      <item.icon className={cn(
        'w-5 h-5 flex-shrink-0 transition-colors',
        isActive(item.path) ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'
      )} />
      {!collapsed && (
        <>
          <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
          {item.badge && (
            <Badge className={cn('text-xs px-1.5 py-0.5', item.badgeColor || 'bg-cyan-500')}>
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </button>
  );

  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {title}
        </p>
      )}
      {items.map((item, index) => (
        <NavLink key={`${item.path}-${index}`} item={item} />
      ))}
    </div>
  );

  return (
    <aside className={cn(
      'h-screen bg-slate-900/95 backdrop-blur-xl border-r border-cyan-500/20 flex flex-col transition-all duration-300',
      collapsed ? 'w-20' : 'w-64'
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-cyan-500/20">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => navigate('/dashboard')}
        >
          <div className="relative flex-shrink-0">
            <Rocket className="w-8 h-8 text-cyan-400" />
            <div className="absolute inset-0 blur-lg bg-cyan-400/30 animate-pulse"></div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Numerikids
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Espace parent</span>
            </div>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className={cn(
        'p-4 border-b border-cyan-500/20',
        collapsed ? 'flex justify-center' : ''
      )}>
        <div className={cn(
          'flex items-center gap-3',
          collapsed ? 'flex-col' : ''
        )}>
          <Avatar className="w-10 h-10 border-2 border-cyan-500/50">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Parent'}
              </p>
              <div className="flex items-center gap-1">
                <Crown className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-yellow-400">Premium</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        <NavSection title="Principal" items={mainNavItems} />
        <NavSection title="Apprentissage" items={learningNavItems} />
        <NavSection title="Boutique" items={storeNavItems} />
        <NavSection title="Compte" items={settingsNavItems} />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-cyan-500/20 space-y-2">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            'w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10',
            collapsed ? 'px-2' : 'justify-start'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Déconnexion</span>}
        </Button>
        
        {onToggle && (
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="w-full text-slate-500 hover:text-cyan-400"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="ml-2">Réduire</span>
              </>
            )}
          </Button>
        )}
      </div>
    </aside>
  );
};

export default DashboardSidebar;
