import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Kanban, CheckSquare, Calendar, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const mainNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/Dashboard' },
  { label: 'Leads', icon: Users, path: '/Leads' },
  { label: 'Pipeline', icon: Kanban, path: '/Pipeline' },
  { label: 'Tasks', icon: CheckSquare, path: '/Tasks' },
  { label: 'Calendar', icon: Calendar, path: '/Calendar' },
  { label: 'Activity', icon: Activity, path: '/Activity' },
];

export default function PrimaryNav() {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-1">
      {mainNavItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group',
              isActive
                ? 'text-accent'
                : 'text-foreground/60 hover:text-foreground hover:bg-muted/30'
            )}
          >
            <item.icon className={cn(
              'w-[18px] h-[18px] transition-all duration-300',
              isActive ? 'text-accent scale-110' : 'text-foreground/50 group-hover:scale-105'
            )} />
            <span className="tracking-tight">{item.label}</span>
            {isActive && (
              <motion.div
                layoutId="activeNav"
                className="absolute inset-0 bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl border border-accent/20 shadow-lg shadow-accent/5"
                style={{ zIndex: -1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}