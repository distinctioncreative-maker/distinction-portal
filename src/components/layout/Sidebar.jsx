import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import {
  LayoutDashboard, Users, Kanban, CheckSquare, Calendar, Activity,
  Settings, ChevronLeft, ChevronRight, Shield, HelpCircle, DollarSign,
  TrendingUp, Bell, LogOut, User, X, Hexagon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOrg } from '../OrgContext';
import AiSearchBar from './AiSearchBar';

const navGroups = [
  {
    label: 'Core',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/Dashboard' },
      { label: 'Leads', icon: Users, path: '/Leads' },
      { label: 'Pipeline', icon: Kanban, path: '/Pipeline' },
      { label: 'Tasks', icon: CheckSquare, path: '/Tasks' },
      { label: 'Calendar', icon: Calendar, path: '/Calendar' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Financials', icon: DollarSign, path: '/Financials' },
      { label: 'Metrics', icon: TrendingUp, path: '/Metrics' },
      { label: 'Activity', icon: Activity, path: '/Activity' },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Settings', icon: Settings, path: '/OrgSettings' },
    ],
  },
  {
    label: 'Internal',
    internal: true,
    items: [
      { label: 'Support Console', icon: Shield, path: '/SupportConsole', requiresRole: ['support', 'superadmin'] },
      { label: 'Org Management', icon: HelpCircle, path: '/OrgManagement', requiresRole: ['superadmin'] },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInternal, userRole, isSupportMode, supportMode, exitSupportMode, organization } = useOrg();
  const [collapsed, setCollapsed] = useState(false);
  const initials = (user?.full_name || user?.email || '??').slice(0, 2).toUpperCase();

  const filteredGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item =>
        !item.requiresRole || item.requiresRole.includes(userRole)
      ),
    }))
    .filter(group => (!group.internal || isInternal) && group.items.length > 0);

  return (
    <TooltipProvider>
      <aside className={cn(
        'h-screen flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 relative flex-shrink-0 backdrop-blur-xl',
        collapsed ? 'w-[72px]' : 'w-80'
      )}>
        {/* Logo & Branding */}
        <div className={cn('flex items-center h-20 px-5 border-b border-sidebar-border/50', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/10 flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/5">
            <Hexagon className="w-5 h-5 text-accent fill-accent/10" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold tracking-tight">Distinction</span>
              <span className="text-[10px] uppercase tracking-wider text-sidebar-muted/70">Operating System</span>
            </div>
          )}
        </div>

        {/* AI Search & Support Mode */}
        {!collapsed && (
          <div className="px-4 pt-6 pb-4 space-y-3 border-b border-sidebar-border/30">
            <AiSearchBar />
            {isSupportMode && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                <Shield className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="text-[10px] font-bold text-amber-400 tracking-wide truncate">
                  SUPPORT — {supportMode.orgName}
                </span>
                <button onClick={exitSupportMode} className="text-amber-400 hover:text-amber-300 transition-colors ml-auto">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {organization && !isSupportMode && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/30">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                <span className="text-[10px] font-medium text-foreground/70 truncate">{organization.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
          {filteredGroups.map(group => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-3 text-[9px] font-bold uppercase tracking-[0.15em] text-sidebar-muted/60">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map(item => {
                  const isActive = location.pathname === item.path;
                  const link = (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative',
                        isActive
                          ? 'bg-gradient-to-r from-sidebar-accent to-sidebar-accent/50 text-sidebar-primary shadow-lg shadow-accent/5'
                          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground'
                      )}
                    >
                      <item.icon className={cn('w-[18px] h-[18px] flex-shrink-0 transition-transform group-hover:scale-110', isActive && 'text-accent')} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {isActive && !collapsed && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-accent shadow-lg shadow-accent/50" />}
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.path}>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
                      </Tooltip>
                    );
                  }
                  return link;
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section: Notifications + User Profile */}
        <div className="border-t border-sidebar-border/30 p-3 space-y-3 flex-shrink-0">
          {!collapsed && (
            <Button variant="ghost" size="sm" className="w-full justify-start gap-3 rounded-xl hover:bg-sidebar-accent/30 text-sidebar-foreground/70 hover:text-sidebar-foreground" asChild>
              <Link to="/Notifications">
                <Bell className="w-[18px] h-[18px]" />
                <span className="text-sm font-medium">Notifications</span>
              </Link>
            </Button>
          )}
          
          {collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full rounded-xl hover:bg-sidebar-accent/30" asChild>
                  <Link to="/Notifications">
                    <Bell className="w-[18px] h-[18px]" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Notifications</TooltipContent>
            </Tooltip>
          )}

          {!collapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-sidebar-accent/30 transition-all duration-200 border border-sidebar-border/30 hover:border-sidebar-border/50">
                  <Avatar className="w-8 h-8 ring-2 ring-border/50">
                    <AvatarFallback className="text-[11px] font-bold bg-gradient-to-br from-accent/20 to-accent/5 text-accent border border-accent/20">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-xs font-semibold truncate">{user?.full_name || 'User'}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-64 p-2 mb-2">
                <div className="px-3 py-2 mb-1">
                  <p className="text-sm font-semibold truncate">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/Profile')} className="rounded-lg">
                  <User className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => base44.auth.logout()} className="rounded-lg text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="w-full flex items-center justify-center p-2.5 rounded-xl hover:bg-sidebar-accent/30 transition-all duration-200">
                  <Avatar className="w-8 h-8 ring-2 ring-border/50">
                    <AvatarFallback className="text-[11px] font-bold bg-gradient-to-br from-accent/20 to-accent/5 text-accent border border-accent/20">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{user?.full_name || 'User'}</TooltipContent>
            </Tooltip>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-2.5 rounded-xl text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 transition-all duration-200"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}