import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadsApi } from '@/api/leads';
import { tasksApi } from '@/api/tasks';
import { activityLogApi } from '@/api/activityLog';
import { logActivity } from '@/lib/logActivity';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Phone, DollarSign, Calendar, CheckSquare, Activity as ActivityIcon, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ClientNoteFeed from '@/components/lead/ClientNoteFeed';

const statusColors = {
  new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  contacted: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  qualified: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  proposal: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  negotiation: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  won: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  lost: 'bg-red-500/10 text-red-500 border-red-500/20',
  archived: 'bg-muted text-muted-foreground border-muted',
};

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeOrgId } = useOrg();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({});

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id, activeOrgId],
    queryFn: async () => leadsApi.get(id, activeOrgId),
    enabled: !!activeOrgId,
  });

  const { data: tasks } = useQuery({
    queryKey: ['leadTasks', id, activeOrgId],
    queryFn: () => tasksApi.list(activeOrgId, { relatedLeadId: id }),
    enabled: !!activeOrgId,
    initialData: [],
  });

  const { data: appointments } = useQuery({
    queryKey: ['leadAppointments', id],
    queryFn: () => [],
    initialData: [],
  });

  const { data: activities } = useQuery({
    queryKey: ['leadActivities', id, activeOrgId],
    queryFn: () => activeOrgId ? activityLogApi.listForEntity(id, activeOrgId, 50) : [],
    enabled: !!activeOrgId,
    initialData: [],
  });

  const updateMut = useMutation({
    mutationFn: (data) => leadsApi.update(id, data),
    onSuccess: (_, data) => {
      qc.invalidateQueries({ queryKey: ['lead', id] });
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['leadActivities', id] });
      qc.invalidateQueries({ queryKey: ['activities'] });
      setShowEdit(false);
      toast.success('Lead updated');
      const name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
      const action = data.status && lead?.status !== data.status ? 'status_changed' : 'updated';
      const description = action === 'status_changed'
        ? `Lead ${name} status changed to ${data.status}`
        : `Lead ${name} updated`;
      logActivity({ orgId: activeOrgId, entityType: 'lead', entityId: id, action, description, userId: user?.id, userEmail: user?.email });
    },
    onError: () => toast.error('Failed to update lead'),
  });

  const deleteMut = useMutation({
    mutationFn: () => leadsApi.update(id, { status: 'archived' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Lead archived');
      logActivity({ orgId: activeOrgId, entityType: 'lead', entityId: id, action: 'status_changed', description: `Lead ${lead?.fullName || lead?.firstName} archived`, userId: user?.id, userEmail: user?.email });
      navigate('/Leads');
    },
  });

  const handleEdit = () => {
    setForm({
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      email: lead.email || '',
      phone: lead.phone || '',
      valueEstimate: lead.valueEstimate || 0,
      notes: lead.notes || '',
      status: lead.status || 'new',
    });
    setShowEdit(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading lead...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Lead not found</p>
          <Button onClick={() => navigate('/Leads')} variant="outline">Back to Leads</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Premium Header */}
      <div className="relative px-8 pt-12 pb-10 border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="relative max-w-[90rem] mx-auto">
          <div className="flex items-center gap-6 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/Leads')} className="rounded-xl hover:bg-muted/50">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight mb-2">{lead.fullName || `${lead.firstName} ${lead.lastName}`}</h1>
              <div className="flex items-center gap-3">
                <Badge className={`px-3 py-1 border capitalize ${statusColors[lead.status] || ''}`}>{lead.status}</Badge>
                {lead.source && <span className="text-sm text-muted-foreground capitalize">{lead.source}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEdit} variant="outline" className="rounded-xl">
                <Edit2 className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button onClick={() => deleteMut.mutate()} variant="outline" className="rounded-xl text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" /> Archive
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-[90rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Contact Info & Notes */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl">
            <h3 className="text-base font-bold mb-6">Contact Information</h3>
            <div className="space-y-4">
              {lead.email && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Mail className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Email</p>
                    <p className="text-sm truncate">{lead.email}</p>
                  </div>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Phone</p>
                    <p className="text-sm">{lead.phone}</p>
                  </div>
                </div>
              )}
              {lead.valueEstimate > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Est. Value</p>
                    <p className="text-2xl font-bold">${lead.valueEstimate.toLocaleString()}</p>
                  </div>
                </div>
              )}
              {lead.notes && (
                <div className="pt-4 border-t border-border/30">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-2">Notes</p>
                  <p className="text-sm text-foreground/90 leading-relaxed">{lead.notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Client Notes Feed */}
          <ClientNoteFeed leadId={id} />
          </div>

          {/* Activity Tabs */}
          <Card className="lg:col-span-2 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl">
            <Tabs defaultValue="tasks" className="w-full">
              <div className="px-6 pt-6 pb-3 border-b border-border/30">
                <TabsList className="h-11 w-full grid grid-cols-3">
                  <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
                  <TabsTrigger value="appointments">Appointments ({appointments.length})</TabsTrigger>
                  <TabsTrigger value="activity">Activity ({activities.length})</TabsTrigger>
                </TabsList>
              </div>
              <div className="p-6">
                <TabsContent value="tasks" className="mt-0">
                  {tasks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-center mx-auto mb-3">
                        <CheckSquare className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-semibold mb-1">No Tasks</p>
                      <p className="text-xs text-muted-foreground/70">Create a task for this lead</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map(task => (
                        <div key={task.id} className="p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/30 hover:from-muted/60 hover:to-muted/30 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold">{task.title}</p>
                            <Badge variant="outline" className="text-[10px] capitalize">{task.status}</Badge>
                          </div>
                          {task.description && <p className="text-xs text-muted-foreground/80 mb-2">{task.description}</p>}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                            <Badge className="text-[10px] capitalize">{task.priority}</Badge>
                            {task.dueAt && <span>Due {format(new Date(task.dueAt), 'MMM d')}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="appointments" className="mt-0">
                  {appointments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-semibold mb-1">No Appointments</p>
                      <p className="text-xs text-muted-foreground/70">Schedule an appointment with this lead</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map(appt => (
                        <div key={appt.id} className="p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/30 hover:from-muted/60 hover:to-muted/30 transition-all">
                          <p className="text-sm font-semibold mb-2">{appt.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                            <Calendar className="w-3 h-3" />
                            {appt.startAt && format(new Date(appt.startAt), 'MMM d, yyyy h:mm a')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="activity" className="mt-0">
                  {activities.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-center mx-auto mb-3">
                        <ActivityIcon className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-semibold mb-1">No Activity</p>
                      <p className="text-xs text-muted-foreground/70">Activity will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activities.map(act => (
                        <div key={act.id} className="p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/30">
                          <p className="text-sm mb-2">{act.description}</p>
                          <p className="text-xs text-muted-foreground/70">{act.created_date && format(new Date(act.created_date), 'MMM d, yyyy h:mm a')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-xl border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Lead</DialogTitle>
            <p className="text-sm text-muted-foreground/80 mt-1">Update lead information</p>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">First Name</Label>
                <Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="h-11 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Last Name</Label>
                <Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="h-11 rounded-xl" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Phone</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="h-11 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(statusColors).map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Est. Value</Label>
                <Input type="number" value={form.valueEstimate} onChange={e => setForm({ ...form, valueEstimate: Number(e.target.value) })} className="h-11 rounded-xl" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="rounded-xl" />
            </div>
            <Button onClick={() => updateMut.mutate({ ...form, fullName: `${form.firstName} ${form.lastName}`.trim() })} disabled={updateMut.isPending} className="w-full h-12 rounded-xl text-base font-semibold">
              Update Lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}