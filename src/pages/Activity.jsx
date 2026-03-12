import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity as ActivityIcon, UserPlus, Edit, CheckCircle, LogIn, Shield, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const actionConfig = {
  created: { icon: UserPlus, color: 'bg-emerald-500/10 text-emerald-500' },
  updated: { icon: Edit, color: 'bg-blue-500/10 text-blue-500' },
  deleted: { icon: Trash2, color: 'bg-red-500/10 text-red-500' },
  completed: { icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-500' },
  login: { icon: LogIn, color: 'bg-cyan-500/10 text-cyan-500' },
  status_changed: { icon: ActivityIcon, color: 'bg-amber-500/10 text-amber-500' },
  assigned: { icon: UserPlus, color: 'bg-violet-500/10 text-violet-500' },
  support_entry: { icon: Shield, color: 'bg-orange-500/10 text-orange-500' },
  support_exit: { icon: Shield, color: 'bg-orange-500/10 text-orange-500' },
  settings_changed: { icon: Edit, color: 'bg-muted text-muted-foreground' },
};

export default function Activity() {
  const { activeOrgId } = useOrg();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.ActivityLog.filter({ organizationId: activeOrgId }, '-created_date', 100) : [],
    initialData: [],
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">Timeline of all actions</p>
      </div>

      <Card className="p-6">
        <div className="space-y-0">
          {activities.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-sm">No activity yet</p>
          )}
          {activities.map((a, i) => {
            const cfg = actionConfig[a.action] || { icon: ActivityIcon, color: 'bg-muted text-muted-foreground' };
            const Icon = cfg.icon;
            const isLast = i === activities.length - 1;

            return (
              <div key={a.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-full ${cfg.color} flex-shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-border mt-2" />}
                </div>
                <div className="pb-6 flex-1">
                  <p className="text-sm font-medium">{a.description || `${a.action} ${a.entityType || ''}`}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {a.entityType && <Badge variant="outline" className="text-[10px]">{a.entityType}</Badge>}
                    <span className="text-[10px] text-muted-foreground">
                      {a.created_date ? format(new Date(a.created_date), 'MMM d, yyyy h:mm a') : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}