import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tasksApi } from '@/api/tasks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckSquare, Clock, AlertCircle, Edit2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const priorityStyles = {
  urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

const statusStyles = {
  todo: 'bg-muted text-muted-foreground border-border',
  in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeOrgId } = useOrg();
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id, activeOrgId],
    queryFn: () => tasksApi.get(id, activeOrgId),
    enabled: !!activeOrgId,
  });

  const updateMut = useMutation({
    mutationFn: (data) => tasksApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task', id] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setIsEditing(false);
      toast.success('Task updated');
    },
    onError: () => toast.error('Failed to update task'),
  });

  const startEdit = () => {
    setForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      dueAt: task.dueAt ? task.dueAt.slice(0, 16) : '',
    });
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading task...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Task not found</p>
          <Button onClick={() => navigate('/Tasks')} variant="outline">Back to Tasks</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative px-8 pt-12 pb-10 border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.08),transparent_50%)]" />
        <div className="relative max-w-[90rem] mx-auto">
          <div className="flex items-center gap-6 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/Tasks')} className="rounded-xl hover:bg-muted/50">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight mb-2">{task.title}</h1>
              <div className="flex items-center gap-3">
                <Badge className={`px-3 py-1 border capitalize ${statusStyles[task.status] || ''}`}>{task.status?.replace('_', ' ')}</Badge>
                <Badge className={`px-3 py-1 border capitalize ${priorityStyles[task.priority] || ''}`}>{task.priority} priority</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={startEdit} variant="outline" className="rounded-xl">
                <Edit2 className="w-4 h-4 mr-2" /> Edit
              </Button>
              {task.status !== 'completed' && (
                <Button
                  onClick={() => updateMut.mutate({ status: 'completed', completedAt: new Date().toISOString() })}
                  className="rounded-xl"
                  disabled={updateMut.isPending}
                >
                  <Check className="w-4 h-4 mr-2" /> Mark Complete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-[90rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Details */}
          <Card className="lg:col-span-2 p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl">
            {isEditing ? (
              <div className="space-y-5">
                <h3 className="text-base font-bold mb-6">Edit Task</h3>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Title</Label>
                  <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="h-11 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Description</Label>
                  <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Status</Label>
                    <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Priority</Label>
                    <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Due Date</Label>
                  <Input type="datetime-local" value={form.dueAt} onChange={e => setForm({ ...form, dueAt: e.target.value })} className="h-11 rounded-xl" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl">Cancel</Button>
                  <Button onClick={() => updateMut.mutate(form)} disabled={updateMut.isPending} className="flex-1 h-11 rounded-xl font-semibold">
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-base font-bold">Task Details</h3>
                {task.description ? (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-2">Description</p>
                    <p className="text-sm text-foreground/90 leading-relaxed">{task.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/70 italic">No description provided.</p>
                )}
              </div>
            )}
          </Card>

          {/* Metadata */}
          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl">
            <h3 className="text-base font-bold mb-6">Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <CheckSquare className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Status</p>
                  <p className="text-sm font-semibold capitalize">{task.status?.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <div className={`p-2 rounded-lg border ${priorityStyles[task.priority] || 'bg-muted/50 border-border'}`}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Priority</p>
                  <p className="text-sm font-semibold capitalize">{task.priority}</p>
                </div>
              </div>

              {task.dueAt && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Due Date</p>
                    <p className="text-sm font-semibold">{format(new Date(task.dueAt), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <div className="p-2 rounded-lg bg-muted/50 border border-border/50">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Created</p>
                  <p className="text-sm font-semibold">{task.created_date && format(new Date(task.created_date), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}