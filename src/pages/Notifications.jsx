import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const typeConfig = {
  info: { icon: Info, color: 'text-blue-500' },
  success: { icon: CheckCircle, color: 'text-emerald-500' },
  warning: { icon: AlertTriangle, color: 'text-amber-500' },
  error: { icon: XCircle, color: 'text-red-500' },
  task: { icon: CheckCircle, color: 'text-violet-500' },
  lead: { icon: Bell, color: 'text-cyan-500' },
  appointment: { icon: Bell, color: 'text-orange-500' },
  system: { icon: Info, color: 'text-muted-foreground' },
};

export default function Notifications() {
  const { activeOrgId } = useOrg();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => user?.id ? base44.entities.Notification.filter({ userId: user.id }, '-created_date', 100) : [],
    initialData: [],
  });

  const markReadMut = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { status: 'read', readAt: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMut = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => n.status === 'unread');
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { status: 'read', readAt: new Date().toISOString() })));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllReadMut.mutate()}>
            <CheckCheck className="w-4 h-4 mr-1.5" /> Mark All Read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 && (
          <Card className="p-12 text-center"><p className="text-muted-foreground text-sm">No notifications</p></Card>
        )}
        {notifications.map(n => {
          const cfg = typeConfig[n.type] || typeConfig.info;
          const Icon = cfg.icon;
          return (
            <Card
              key={n.id}
              className={`p-4 flex items-start gap-3 transition-colors cursor-pointer hover:shadow-sm ${n.status === 'unread' ? 'bg-accent/5 border-accent/20' : ''}`}
              onClick={() => n.status === 'unread' && markReadMut.mutate(n.id)}
            >
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm ${n.status === 'unread' ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                  {n.status === 'unread' && <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />}
                </div>
                {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {n.created_date ? format(new Date(n.created_date), 'MMM d, h:mm a') : ''}
                </p>
              </div>
              {n.priority === 'high' || n.priority === 'urgent' ? (
                <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20">{n.priority}</Badge>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}