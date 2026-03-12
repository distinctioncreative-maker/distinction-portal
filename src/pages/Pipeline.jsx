import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

export default function Pipeline() {
  const { activeOrgId } = useOrg();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', value: 0, probability: 50, stageId: '', nextAction: '' });

  const { data: stages } = useQuery({
    queryKey: ['stages', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.PipelineStage.filter({ organizationId: activeOrgId }) : [],
    initialData: [],
  });

  const { data: items } = useQuery({
    queryKey: ['pipelineItems', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.PipelineItem.filter({ organizationId: activeOrgId }) : [],
    initialData: [],
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.PipelineItem.create({ ...data, organizationId: activeOrgId, status: 'active' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pipelineItems'] }); setShowCreate(false); },
  });

  const moveMut = useMutation({
    mutationFn: ({ id, stageId }) => base44.entities.PipelineItem.update(id, { stageId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipelineItems'] }),
  });

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  return (
    <div className="p-6 max-w-full mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.filter(i => i.status === 'active').length} active deals · ${items.filter(i => i.status === 'active').reduce((s, i) => s + (i.value || 0), 0).toLocaleString()} total value
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm"><Plus className="w-4 h-4 mr-1.5" /> New Deal</Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {sortedStages.map(stage => {
          const stageItems = items.filter(i => i.stageId === stage.id && i.status === 'active');
          const totalValue = stageItems.reduce((s, i) => s + (i.value || 0), 0);

          return (
            <div key={stage.id} className="flex-shrink-0 w-72">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-sm font-semibold">{stage.name}</span>
                  <Badge variant="secondary" className="text-[10px]">{stageItems.length}</Badge>
                </div>
                <span className="text-xs text-muted-foreground font-medium">${totalValue.toLocaleString()}</span>
              </div>

              <div className="space-y-2 min-h-[200px]">
                {stageItems.map(item => (
                  <Card key={item.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <p className="text-sm font-medium mb-2">{item.title}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <DollarSign className="w-3 h-3" /> ${(item.value || 0).toLocaleString()}
                        <span className="ml-auto">{item.probability}%</span>
                      </div>
                      {item.nextAction && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" /> {item.nextAction}
                        </div>
                      )}
                    </div>
                    {/* Stage move buttons */}
                    <div className="flex gap-1 mt-3">
                      {sortedStages.filter(s => s.id !== stage.id).slice(0, 3).map(s => (
                        <button
                          key={s.id}
                          onClick={() => moveMut.mutate({ id: item.id, stageId: s.id })}
                          className="text-[10px] px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                        >
                          → {s.name}
                        </button>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
        {sortedStages.length === 0 && (
          <div className="text-center py-20 w-full">
            <p className="text-muted-foreground">No pipeline stages configured. Set up stages in Organization Settings.</p>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Deal</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Value ($)</Label><Input type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">Probability (%)</Label><Input type="number" value={form.probability} onChange={e => setForm({ ...form, probability: Number(e.target.value) })} /></div>
            </div>
            <div>
              <Label className="text-xs">Stage</Label>
              <Select value={form.stageId} onValueChange={v => setForm({ ...form, stageId: v })}>
                <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                <SelectContent>{sortedStages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Next Action</Label><Input value={form.nextAction} onChange={e => setForm({ ...form, nextAction: e.target.value })} /></div>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.title || !form.stageId || createMut.isPending} className="w-full">Create Deal</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}