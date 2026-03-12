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
import { Plus, AlertCircle } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

const priorityStyles = {
  urgent: 'bg-red-500/10 text-red-500', high: 'bg-orange-500/10 text-orange-500',
  medium: 'bg-blue-500/10 text-blue-500', low: 'bg-emerald-500/10 text-emerald-500',
};

export default function Tasks() {
  const { activeOrgId } = useOrg();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueAt: '' });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.Task.filter({ organizationId: activeOrgId }, '-created_date', 200) : [],
    initialData: [],
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Task.create({ ...data, organizationId: activeOrgId, status: 'todo', createdByUserId: user?.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setShowCreate(false); setForm({ title: '', description: '', priority: 'medium', dueAt: '' }); },
  });

  const toggleMut = useMutation({
    mutationFn: (task) => base44.entities.Task.update(task.id, {
      status: task.status === 'completed' ? 'todo' : 'completed',
      completedAt: task.status === 'completed' ? null : new Date().toISOString(),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const filtered = tasks.filter(t => {
    if (tab === 'mine') return t.assignedToUserId === user?.id || t.createdByUserId === user?.id;
    if (tab === 'completed') return t.status === 'completed';
    if (tab === 'overdue') return t.status !== 'completed' && t.dueAt && isPast(new Date(t.dueAt)) && !isToday(new Date(t.dueAt));
    return t.status !== 'completed' && t.status !== 'cancelled';
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">{tasks.filter(t => t.status !== 'completed').length} active tasks</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm"><Plus className="w-4 h-4 mr-1.5" /> New Task</Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">Active</TabsTrigger>
          <TabsTrigger value="mine">My Tasks</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <Card className="p-12 text-center"><p className="text-muted-foreground text-sm">No tasks found</p></Card>
        )}
        {filtered.map(task => {
          const overdue = task.status !== 'completed' && task.dueAt && isPast(new Date(task.dueAt)) && !isToday(new Date(task.dueAt));
          return (
            <Card key={task.id} className="p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
              <Checkbox
                checked={task.status === 'completed'}
                onCheckedChange={() => toggleMut.mutate(task)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                  {overdue && <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                </div>
                {task.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>}
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={`text-[10px] ${priorityStyles[task.priority] || ''}`}>{task.priority}</Badge>
                  {task.dueAt && (
                    <span className={`text-[10px] ${overdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                      Due {format(new Date(task.dueAt), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['low', 'medium', 'high', 'urgent'].map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Due Date</Label><Input type="date" value={form.dueAt} onChange={e => setForm({ ...form, dueAt: e.target.value })} /></div>
            </div>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.title || createMut.isPending} className="w-full">Create Task</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}