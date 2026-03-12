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
        'h-screen flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 relative flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}>
        {/* Logo */}
        <div className={cn('flex items-center h-16 px-4 border-b border-sidebar-border', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <Hexagon className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-wide truncate">Distinction OS</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {filteredGroups.map(group => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const isActive = location.pathname === item.path;
                  const link = (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-primary'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      )}
                    >
                      <item.icon className={cn('w-4 h-4 flex-shrink-0', isActive && 'text-sidebar-primary')} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
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
        <div className="border-t border-sidebar-border p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}