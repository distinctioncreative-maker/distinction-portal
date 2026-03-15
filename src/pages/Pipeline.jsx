import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, Clock, User, TrendingUp, Kanban, ArrowRight, Settings2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import StageManager from '@/components/pipeline/StageManager';

export default function Pipeline() {
  const { activeOrgId } = useOrg();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showStageManager, setShowStageManager] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [form, setForm] = useState({ title: '', value: 0, probability: 50, stageId: '', nextAction: '', ownerUserId: '' });

  const { data: stages } = useQuery({
    queryKey: ['stages', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.PipelineStage.filter({ organizationId: activeOrgId }, 'order') : [],
    initialData: [],
  });

  const { data: items } = useQuery({
    queryKey: ['pipelineItems', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.PipelineItem.filter({ organizationId: activeOrgId }) : [],
    initialData: [],
  });

  const createMut = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        organizationId: activeOrgId,
        status: 'active',
        ownerUserId: data.ownerUserId || user?.id,
      };
      return editingDeal
        ? base44.entities.PipelineItem.update(editingDeal.id, payload)
        : base44.entities.PipelineItem.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipelineItems'] });
      setShowCreate(false);
      setEditingDeal(null);
      setForm({ title: '', value: 0, probability: 50, stageId: '', nextAction: '', ownerUserId: '' });
      toast.success(editingDeal ? 'Deal updated' : 'Deal created');
    },
    onError: (error) => {
      toast.error('Failed to save deal');
      console.error(error);
    },
  });

  const moveMut = useMutation({
    mutationFn: ({ id, stageId }) => base44.entities.PipelineItem.update(id, { stageId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipelineItems'] });
      toast.success('Deal moved');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.PipelineItem.update(id, { status: 'lost' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipelineItems'] });
      toast.success('Deal marked as lost');
    },
  });

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);
  const activeItems = items.filter(i => i.status === 'active');
  const totalValue = activeItems.reduce((s, i) => s + (i.value || 0), 0);

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setForm({
      title: deal.title || '',
      value: deal.value || 0,
      probability: deal.probability || 50,
      stageId: deal.stageId || '',
      nextAction: deal.nextAction || '',
      ownerUserId: deal.ownerUserId || '',
    });
    setShowCreate(true);
  };

  return (
    <div className="min-h-screen">
      {/* Premium Header */}
      <div className="relative px-8 pt-12 pb-10 border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,200,100,0.05),transparent_50%)]" />
        <div className="relative max-w-[120rem] mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 shadow-lg shadow-violet-500/5">
                  <Kanban className="w-7 h-7 text-violet-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">Deal Pipeline</h1>
                  <p className="text-base text-muted-foreground/80 mt-1.5">{activeItems.length} active deals · ${totalValue.toLocaleString()} total value</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowStageManager(true)} variant="outline" size="lg" className="rounded-xl px-5">
                <Settings2 className="w-4 h-4 mr-2" /> Manage Stages
              </Button>
              <Button onClick={() => { setEditingDeal(null); setShowCreate(true); }} size="lg" className="rounded-xl px-6 shadow-lg hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300">
                <Plus className="w-5 h-5 mr-2" /> New Deal
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            {sortedStages.slice(0, 4).map(stage => {
              const stageItems = activeItems.filter(i => i.stageId === stage.id);
              const stageValue = stageItems.reduce((s, i) => s + (i.value || 0), 0);
              return (
                <div key={stage.id} className="p-5 rounded-xl bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-xl border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{stage.name}</span>
                  </div>
                  <p className="text-2xl font-bold">{stageItems.length}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">${stageValue.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="px-8 py-8 max-w-[120rem] mx-auto">
        <div className="flex gap-5 overflow-x-auto pb-6">
          {sortedStages.map(stage => {
            const stageItems = activeItems.filter(i => i.stageId === stage.id);
            const totalValue = stageItems.reduce((s, i) => s + (i.value || 0), 0);

            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <div className="sticky top-0 bg-background/80 backdrop-blur-xl pb-4 border-b border-border/30 mb-4">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: stage.color, boxShadow: `0 0 12px ${stage.color}40` }} />
                      <span className="text-sm font-bold">{stage.name}</span>
                      <Badge variant="secondary" className="text-[10px] px-2">{stageItems.length}</Badge>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">${totalValue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3 min-h-[400px]">
                  {stageItems.map(item => (
                    <Card key={item.id} className="p-5 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300 cursor-pointer group" onClick={() => handleEdit(item)}>
                      <p className="text-sm font-semibold mb-3 group-hover:text-accent transition-colors">{item.title}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span className="font-bold">${(item.value || 0).toLocaleString()}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] px-2 border-accent/30 text-accent">
                            {item.probability}%
                          </Badge>
                        </div>
                        {item.nextAction && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 pt-2 border-t border-border/30">
                            <Clock className="w-3 h-3" />
                            <span className="line-clamp-1">{item.nextAction}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Quick Move Actions */}
                      <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border/20">
                        {sortedStages.filter(s => s.id !== stage.id).slice(0, 2).map(s => (
                          <button
                            key={s.id}
                            onClick={(e) => { e.stopPropagation(); moveMut.mutate({ id: item.id, stageId: s.id }); }}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-1 font-medium"
                          >
                            <ArrowRight className="w-2.5 h-2.5" />
                            {s.name}
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
            <div className="flex-1 flex items-center justify-center py-32">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-center mx-auto mb-4">
                  <Kanban className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-semibold mb-1">No Pipeline Stages</p>
                <p className="text-xs text-muted-foreground/70">Configure stages in Organization Settings</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <StageManager stages={stages} open={showStageManager} onOpenChange={setShowStageManager} />

      {/* Premium Create/Edit Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) setEditingDeal(null); }}>
        <DialogContent className="max-w-2xl border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{editingDeal ? 'Edit Deal' : 'New Deal'}</DialogTitle>
            <p className="text-sm text-muted-foreground/80 mt-1">{editingDeal ? 'Update deal information' : 'Create a new pipeline opportunity'}</p>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Deal Title</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Acme Corp - Enterprise Plan" className="h-11 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Deal Value ($)</Label>
                <Input type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} className="h-11 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Probability (%)</Label>
                <Input type="number" min="0" max="100" value={form.probability} onChange={e => setForm({ ...form, probability: Number(e.target.value) })} className="h-11 rounded-xl" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Pipeline Stage</Label>
              <Select value={form.stageId} onValueChange={v => setForm({ ...form, stageId: v })}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select stage" /></SelectTrigger>
                <SelectContent>{sortedStages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Next Action</Label>
              <Textarea value={form.nextAction} onChange={e => setForm({ ...form, nextAction: e.target.value })} placeholder="What's the next step?" rows={2} className="rounded-xl" />
            </div>
            <div className="flex gap-3 pt-2">
              {editingDeal && (
                <Button onClick={() => { deleteMut.mutate(editingDeal.id); setShowCreate(false); setEditingDeal(null); }} variant="outline" className="rounded-xl" disabled={createMut.isPending}>
                  Mark as Lost
                </Button>
              )}
              <Button onClick={() => createMut.mutate(form)} disabled={!form.title || !form.stageId || createMut.isPending || !activeOrgId} className="flex-1 h-12 rounded-xl text-base font-semibold shadow-lg hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300">
                <TrendingUp className="w-5 h-5 mr-2" /> {editingDeal ? 'Update Deal' : 'Create Deal'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}