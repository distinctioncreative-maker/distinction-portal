import React from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { UserPlus, ListPlus, CalendarPlus, Sparkles } from 'lucide-react';

const actions = [
  { label: 'New Lead', icon: UserPlus, path: '/Leads', color: 'text-blue-500' },
  { label: 'New Task', icon: ListPlus, path: '/Tasks', color: 'text-emerald-500' },
  { label: 'Book Call', icon: CalendarPlus, path: '/Calendar', color: 'text-violet-500' },
  { label: 'AI Insights', icon: Sparkles, path: '/Dashboard', color: 'text-amber-500' },
];

export default function QuickActions() {
  return (
    <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-base font-bold tracking-tight">Actions</h3>
        <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-wider">Quick Access</p>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        {actions.map(a => (
          <Link
            key={a.label}
            to={a.path}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 hover:from-muted/60 hover:to-muted/30 transition-all duration-200 border border-border/30 hover:border-border/50 group"
          >
            <div className={`p-2.5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/30 group-hover:scale-110 transition-transform duration-200`}>
              <a.icon className={`w-5 h-5 ${a.color}`} />
            </div>
            <span className="text-[11px] font-semibold text-center">{a.label}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}