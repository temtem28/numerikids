import React, { useState } from 'react';
import { Bell, Search, Menu, X } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { OfflineIndicator } from './OfflineIndicator';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  actions?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title,
  subtitle,
  showSearch = false,
  actions
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock notifications - in real app, fetch from database
  const notifications = [
    { id: 1, title: 'Alex a terminé une leçon', message: 'Introduction à Python complétée!', time: 'Il y a 5 min', unread: true },
    { id: 2, title: 'Nouveau badge débloqué', message: 'Emma a obtenu le badge "Codeur Débutant"', time: 'Il y a 1h', unread: true },
    { id: 3, title: 'Rappel', message: 'Objectif hebdomadaire presque atteint', time: 'Il y a 3h', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          mobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        {/* Sidebar Panel */}
        <div 
          className={`absolute left-0 top-0 h-full transform transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <DashboardSidebar />
          {/* Close button for mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>


      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-cyan-500/20 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
          {/* Left Side - Mobile Menu & Title */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-400 hover:text-cyan-400"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            
            {title && (
              <div>
                <h1 className="text-lg font-bold text-white">{title}</h1>
                {subtitle && (
                  <p className="text-xs text-slate-400">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Center - Search (optional) */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  placeholder="Rechercher..."
                  className="pl-10 bg-slate-800/50 border-slate-700 focus:border-cyan-500/50 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          )}

          {/* Right Side - Actions & Notifications */}
          <div className="flex items-center gap-3">
            {actions}
            
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative text-slate-400 hover:text-cyan-400"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-80 bg-slate-900 border-cyan-500/20"
              >
                <DropdownMenuLabel className="text-white flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400">
                      {unreadCount} nouvelles
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                {notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    className={cn(
                      'flex flex-col items-start gap-1 p-3 cursor-pointer',
                      notification.unread ? 'bg-cyan-500/5' : ''
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {notification.unread && (
                        <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                      )}
                      <span className="font-medium text-white text-sm">
                        {notification.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 pl-4">
                      {notification.message}
                    </p>
                    <span className="text-xs text-slate-500 pl-4">
                      {notification.time}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-center text-cyan-400 hover:text-cyan-300 justify-center">
                  Voir toutes les notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Offline Indicator */}
        <OfflineIndicator />
      </div>
    </div>
  );
};

export default DashboardLayout;
