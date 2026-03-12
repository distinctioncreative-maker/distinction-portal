import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, AlertCircle } from 'lucide-react';
import { format, isToday, isPast } from 'date-fns';

const priorityStyles = {
  urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

export default function TasksDueWidget({ tasks }) {
  const dueTasks = (tasks || [])
    .filter(t => t.status !== 'completed' && t.status !== 'cancelled' && t.dueAt)
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
    .slice(0, 6);

  return (
    <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold tracking-tight">Priority Tasks</h3>
          <p className="text-xs text-muted-foreground/70 mt-1">{dueTasks.length} items require attention</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {dueTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <CheckSquare className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold mb-1">All Clear</p>
            <p className="text-xs text-muted-foreground/70">No pending tasks</p>
          </div>
        )}
        {dueTasks.map(t => {
          const overdue = t.dueAt && isPast(new Date(t.dueAt)) && !isToday(new Date(t.dueAt));
          return (
            <div key={t.id} className="group flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 hover:from-muted/60 hover:to-muted/30 transition-all duration-200 border border-border/30 hover:border-border/50">
              {overdue ? (
                <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                </div>
              ) : (
                <div className="p-1.5 rounded-lg bg-muted/50 border border-border/40 group-hover:bg-muted/70 transition-colors">
                  <CheckSquare className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.title}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  {t.dueAt ? format(new Date(t.dueAt), 'MMM d, h:mm a') : 'No date'}
                </p>
              </div>
              <Badge variant="outline" className={`text-[10px] px-2.5 py-1 ${priorityStyles[t.priority] || ''}`}>
                {t.priority}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}