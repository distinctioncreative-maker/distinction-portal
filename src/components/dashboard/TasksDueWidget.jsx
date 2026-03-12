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
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Tasks Due</h3>
        <span className="text-xs text-muted-foreground">{dueTasks.length} pending</span>
      </div>
      <div className="space-y-2">
        {dueTasks.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">All clear!</p>
        )}
        {dueTasks.map(t => {
          const overdue = t.dueAt && isPast(new Date(t.dueAt)) && !isToday(new Date(t.dueAt));
          return (
            <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors">
              {overdue ? (
                <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              ) : (
                <CheckSquare className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{t.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {t.dueAt ? format(new Date(t.dueAt), 'MMM d') : 'No date'}
                </p>
              </div>
              <Badge variant="outline" className={`text-[10px] ${priorityStyles[t.priority] || ''}`}>
                {t.priority}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}