import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, AlertCircle, CheckSquare, ListTodo, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { toast } from 'sonner';

const priorityStyles = {
  urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

export default function Tasks() {
  const { activeOrgId } = useOrg();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueAt: '', assignedToUserId: '' });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.Task.filter({ organizationId: activeOrgId }, '-created_date', 200) : [],
    initialData: [],
  });

  const createMut = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        organizationId: activeOrgId,
        status: data.status || 'todo',
        createdByUserId: user?.id,
        dueAt: data.dueAt ? new Date(data.dueAt).toISOString() : null,
      };
      return editingTask
        ? base44.entities.Task.update(editingTask.id, payload)
        : base44.entities.Task.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setShowCreate(false);
      setEditingTask(null);
      setForm({ title: '', description: '', priority: 'medium', dueAt: '', assignedToUserId: '' });
      toast.success(editingTask ? 'Task updated' : 'Task created');
    },
    onError: (error) => {
      toast.error('Failed to save task');
      console.error(error);
    },
  });

  const toggleMut = useMutation({
    mutationFn: (task) => base44.entities.Task.update(task.id, {
      status: task.status === 'completed' ? 'todo' : 'completed',
      completedAt: task.status === 'completed' ? null : new Date().toISOString(),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Task.update(id, { status: 'cancelled' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task cancelled');
    },
  });

  const filtered = tasks.filter(t => {
    if (t.status === 'cancelled') return false;
    if (tab === 'mine') return t.assignedToUserId === user?.id || t.createdByUserId === user?.id;
    if (tab === 'completed') return t.status === 'completed';
    if (tab === 'overdue') return t.status !== 'completed' && t.dueAt && isPast(new Date(t.dueAt)) && !isToday(new Date(t.dueAt));
    return t.status !== 'completed';
  });

  const handleEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      dueAt: task.dueAt ? format(new Date(task.dueAt), "yyyy-MM-dd'T'HH:mm") : '',
      assignedToUserId: task.assignedToUserId || '',
    });
    setShowCreate(true);
  };

  return (
    <div className="min-h-screen">
      {/* Premium Header */}
      <div className="relative px-8 pt-12 pb-10 border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.05),transparent_50%)]" />
        <div className="relative max-w-[90rem] mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                  <ListTodo className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">Task Management</h1>
                  <p className="text-base text-muted-foreground/80 mt-1.5">{tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length} active tasks</p>
                </div>
              </div>
            </div>
            <Button onClick={() => { setEditingTask(null); setShowCreate(true); }} size="lg" className="rounded-xl px-6 shadow-lg hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300">
              <Plus className="w-5 h-5 mr-2" /> New Task
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="h-11">
              <TabsTrigger value="all" className="px-6">Active</TabsTrigger>
              <TabsTrigger value="mine" className="px-6">My Tasks</TabsTrigger>
              <TabsTrigger value="overdue" className="px-6">Overdue</TabsTrigger>
              <TabsTrigger value="completed" className="px-6">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tasks List */}
      <div className="px-8 py-8 max-w-[90rem] mx-auto">
        <div className="space-y-3">
          {isLoading && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          )}
          {filtered.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-sm font-semibold mb-1">No Tasks Found</p>
              <p className="text-xs text-muted-foreground/70">
                {tab === 'completed' ? 'No completed tasks yet' : tab === 'overdue' ? 'All tasks are on track' : 'Create your first task to get started'}
              </p>
            </div>
          )}
          {filtered.map(task => {
            const overdue = task.status !== 'completed' && task.dueAt && isPast(new Date(task.dueAt)) && !isToday(new Date(task.dueAt));
            return (
              <Card key={task.id} className="p-5 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={task.status === 'completed'}
                    onCheckedChange={() => toggleMut.mutate(task)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleEdit(task)}>
                    <div className="flex items-center gap-2.5 mb-2">
                      <p className={`text-sm font-semibold ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'group-hover:text-accent transition-colors'}`}>
                        {task.title}
                      </p>
                      {overdue && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20">
                          <AlertCircle className="w-3 h-3 text-red-400" />
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Overdue</span>
                        </div>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground/80 mb-3 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className={`text-[10px] px-2.5 py-1 border capitalize ${priorityStyles[task.priority] || ''}`}>
                        {task.priority}
                      </Badge>
                      {task.dueAt && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                          <CalendarIcon className="w-3 h-3" />
                          <span className={overdue ? 'text-red-400 font-semibold' : ''}>
                            {format(new Date(task.dueAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); deleteMut.mutate(task.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Premium Create/Edit Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) setEditingTask(null); }}>
        <DialogContent className="max-w-xl border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
            <p className="text-sm text-muted-foreground/80 mt-1">{editingTask ? 'Update task details' : 'Create a new task to track'}</p>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Task Title</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Add details..." rows={3} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['low', 'medium', 'high', 'urgent'].map(p => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Due Date & Time</Label>
                <Input type="datetime-local" value={form.dueAt} onChange={e => setForm({ ...form, dueAt: e.target.value })} className="h-11 rounded-xl" />
              </div>
            </div>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.title || createMut.isPending} className="w-full h-12 rounded-xl text-base font-semibold shadow-lg hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300">
              <CheckSquare className="w-5 h-5 mr-2" /> {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}