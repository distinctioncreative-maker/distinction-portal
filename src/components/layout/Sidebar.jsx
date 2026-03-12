import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useOrg } from '../OrgContext';
import {
  LayoutDashboard, Users, Kanban, CheckSquare, Calendar,
  Activity, Bell, Settings, User, Shield, FileText, Building2,
  ChevronLeft, ChevronRight, LogOut, Hexagon, ToggleLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navGroups = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/Dashboard' },
      { label: 'Leads', icon: Users, path: '/Leads' },
      { label: 'Pipeline', icon: Kanban, path: '/Pipeline' },
      { label: 'Tasks', icon: CheckSquare, path: '/Tasks' },
      { label: 'Calendar', icon: Calendar, path: '/Calendar' },
      { label: 'Activity', icon: Activity, path: '/Activity' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Notifications', icon: Bell, path: '/Notifications' },
      { label: 'Organization', icon: Building2, path: '/OrgSettings', roles: ['owner', 'admin', 'superadmin'] },
      { label: 'Billing', icon: FileText, path: '/Billing', roles: ['owner', 'admin', 'superadmin'] },
      { label: 'Profile', icon: User, path: '/Profile' },
      { label: 'Widgets', icon: ToggleLeft, path: '/WidgetPreferences' },
    ],
  },
  {
    label: 'Internal',
    internal: true,
    items: [
      { label: 'Support Console', icon: Shield, path: '/SupportConsole', roles: ['support', 'superadmin'] },
      { label: 'Support Logs', icon: FileText, path: '/SupportLogs', roles: ['support', 'superadmin'] },
      { label: 'Organizations', icon: Building2, path: '/OrgManagement', roles: ['superadmin'] },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { isSupportMode } = useOrg();
  const userRole = user?.role || 'staff';

  const filteredGroups = navGroups
    .filter(g => !g.internal || ['support', 'superadmin'].includes(userRole))
    .map(g => ({
      ...g,
      items: g.items.filter(item => !item.roles || item.roles.includes(userRole)),
    }))
    .filter(g => g.items.length > 0);

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        'h-screen flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 relative flex-shrink-0 backdrop-blur-xl',
        collapsed ? 'w-[72px]' : 'w-64'
      )}>
        {/* Logo */}
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

        {/* Footer */}
        <div className="border-t border-sidebar-border/50 p-3">
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