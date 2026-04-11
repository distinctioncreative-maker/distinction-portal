import React, { useState } from 'react';
import { pipelineApi } from '@/api/pipeline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, GripVertical, Pencil, Trash2, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
];

export default function StageManager({ stages, open, onOpenChange }) {
  const { activeOrgId } = useOrg();
  const qc = useQueryClient();
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [editingStage, setEditingStage] = useState(null);

  const createMut = useMutation({
    mutationFn: () => pipelineApi.stages.create({
      organizationId: activeOrgId,
      name: newName,
      color: newColor,
      order: stages.length,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stages'] });
      setNewName('');
      setNewColor(COLORS[0]);
      toast.success('Stage created');
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => pipelineApi.stages.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stages'] });
      setEditingStage(null);
      toast.success('Stage updated');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => pipelineApi.stages.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stages'] });
      toast.success('Stage deleted');
    },
  });

  const moveStage = (stage, direction) => {
    const sorted = [...stages].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(s => s.id === stage.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swapStage = sorted[swapIdx];
    Promise.all([
      pipelineApi.stages.update(stage.id, { order: swapStage.order }),
      pipelineApi.stages.update(swapStage.id, { order: stage.order }),
    ]).then(() => qc.invalidateQueries({ queryKey: ['stages'] }));
  };

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-accent" /> Manage Pipeline Stages
          </DialogTitle>
          <p className="text-sm text-muted-foreground/80">Add, edit, reorder, or delete pipeline stages</p>
        </DialogHeader>

        {/* Existing Stages */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {sortedStages.map((stage, idx) => (
            <div key={stage.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30 group">
              <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
              {editingStage?.id === stage.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editingStage.name}
                    onChange={e => setEditingStage({ ...editingStage, name: e.target.value })}
                    className="h-8 rounded-lg text-sm"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setEditingStage({ ...editingStage, color: c })}
                        className="w-5 h-5 rounded-full border-2 transition-all"
                        style={{ backgroundColor: c, borderColor: editingStage.color === c ? 'white' : 'transparent' }}
                      />
                    ))}
                  </div>
                  <Button size="sm" onClick={() => updateMut.mutate({ id: stage.id, data: { name: editingStage.name, color: editingStage.color } })} className="h-8 px-3 rounded-lg text-xs">Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingStage(null)} className="h-8 px-2 rounded-lg">✕</Button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium">{stage.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" onClick={() => moveStage(stage, -1)} disabled={idx === 0} className="h-7 w-7 p-0 rounded-lg text-xs">↑</Button>
                    <Button size="sm" variant="ghost" onClick={() => moveStage(stage, 1)} disabled={idx === sortedStages.length - 1} className="h-7 w-7 p-0 rounded-lg text-xs">↓</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingStage({ id: stage.id, name: stage.name, color: stage.color })} className="h-7 w-7 p-0 rounded-lg">
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(stage.id)} className="h-7 w-7 p-0 rounded-lg text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
          {sortedStages.length === 0 && (
            <p className="text-sm text-muted-foreground/70 text-center py-4">No stages yet. Add your first one below.</p>
          )}
        </div>

        {/* Add New Stage */}
        <div className="pt-4 border-t border-border/30 space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Add New Stage</Label>
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Stage name (e.g. Proposal, Discovery...)"
            className="h-11 rounded-xl"
            onKeyDown={e => e.key === 'Enter' && newName.trim() && createMut.mutate()}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground/70">Color:</span>
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className="w-6 h-6 rounded-full border-2 transition-all hover:scale-110"
                style={{ backgroundColor: c, borderColor: newColor === c ? 'white' : 'transparent' }}
              />
            ))}
          </div>
          <Button
            onClick={() => createMut.mutate()}
            disabled={!newName.trim() || createMut.isPending}
            className="w-full h-11 rounded-xl font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Stage
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}