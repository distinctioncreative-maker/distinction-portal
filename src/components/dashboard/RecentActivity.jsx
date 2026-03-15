import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Activity, UserPlus, CheckCircle, Calendar, Edit, LogIn, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const actionIcons = {
  created: UserPlus,
  updated: Edit,
  completed: CheckCircle,
  login: LogIn,
  status_changed: Activity,
};

export default function RecentActivity({ activities }) {
  const navigate = useNavigate();
  const items = (activities || []).slice(0, 8);

  const handleActivityClick = (a) => {
    if (!a.entityType || !a.entityId) return;
    const type = a.entityType?.toLowerCase();
    if (type === 'lead') navigate(`/LeadDetail/${a.entityId}`);
    else if (type === 'task') navigate(`/TaskDetail/${a.entityId}`);
    else if (type === 'appointment') navigate('/Calendar');
    else if (type === 'pipelineitem') navigate('/Pipeline');
  };

  return (
    <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500">
      <div className="mb-6">
        <h3 className="text-base font-bold tracking-tight">Activity Stream</h3>
        <p className="text-xs text-muted-foreground/70 mt-1">Recent system events</p>
      </div>
      <div className="space-y-3.5">
        {items.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-xs text-muted-foreground/70">No recent activity</p>
          </div>
        )}
        {items.map(a => {
          const Icon = actionIcons[a.action] || Activity;
          const isClickable = !!(a.entityType && a.entityId);
          return (
            <div
              key={a.id}
              onClick={() => handleActivityClick(a)}
              className={`flex items-start gap-3 group rounded-xl p-2 -mx-2 transition-all duration-200 ${isClickable ? 'cursor-pointer hover:bg-muted/30 hover:shadow-sm' : ''}`}
            >
              <div className="mt-0.5 p-2 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/30 flex-shrink-0 group-hover:from-muted/70 group-hover:to-muted/30 transition-colors">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm leading-relaxed">{a.description || `${a.action} ${a.entityType || ''}`}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1 tracking-wide">
                  {a.created_date ? format(new Date(a.created_date), 'MMM d, h:mm a') : ''}
                </p>
              </div>
              {isClickable && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors mt-1 flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </Card>
  );
}