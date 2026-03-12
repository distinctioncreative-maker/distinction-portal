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
    <Card className="p-5">
      <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(a => (
          <Link
            key={a.label}
            to={a.path}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors group"
          >
            <a.icon className={`w-4 h-4 ${a.color} group-hover:scale-110 transition-transform`} />
            <span className="text-xs font-medium">{a.label}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}