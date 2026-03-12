import React from 'react';
import { Card } from '@/components/ui/card';
import { Activity, UserPlus, CheckCircle, Calendar, Edit, LogIn } from 'lucide-react';
import { format } from 'date-fns';

const actionIcons = {
  created: UserPlus,
  updated: Edit,
  completed: CheckCircle,
  login: LogIn,
  status_changed: Activity,
};

export default function RecentActivity({ activities }) {
  const items = (activities || []).slice(0, 8);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No recent activity</p>
        )}
        {items.map(a => {
          const Icon = actionIcons[a.action] || Activity;
          return (
            <div key={a.id} className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 rounded-lg bg-muted flex-shrink-0">
                <Icon className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-snug">{a.description || `${a.action} ${a.entityType || ''}`}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {a.created_date ? format(new Date(a.created_date), 'MMM d, h:mm a') : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}