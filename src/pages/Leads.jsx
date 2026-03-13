import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Mail, Phone, Calendar, UserPlus, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  new: 'bg-blue-500/10 text-blue-500 border-blue-500/20', contacted: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  qualified: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', proposal: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  negotiation: 'bg-amber-500/10 text-amber-500 border-amber-500/20', won: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  lost: 'bg-red-500/10 text-red-500 border-red-500/20', archived: 'bg-muted text-muted-foreground border-muted',
};

const sourceLabels = { website: 'Website', referral: 'Referral', social_media: 'Social', cold_outreach: 'Outreach', paid_ads: 'Paid Ads', organic: 'Organic', partner: 'Partner', event: 'Event', other: 'Other' };

export default function Leads() {
  const { activeOrgId } = useOrg();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', source: 'website', status: 'new', valueEstimate: 0, notes: '' });

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.Lead.filter({ organizationId: activeOrgId }, '-created_date', 200) : [],
    initialData: [],
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Lead.create({ ...data, organizationId: activeOrgId, fullName: `${data.firstName} ${data.lastName}`.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['activities'] });
      setShowCreate(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', source: 'website', status: 'new', valueEstimate: 0, notes: '' });
      toast.success('Lead created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create lead');
      console.error(error);
    },
  });

  const filtered = leads.filter(l => {
    const matchSearch = !search || [l.fullName, l.firstName, l.lastName, l.email, l.phone].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen">
      {/* Cinematic Header */}
      <div className="relative px-8 pt-12 pb-10 border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(100,150,255,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,200,100,0.05),transparent_50%)]" />
        <div className="relative max-w-[90rem] mx-auto">
          <div className="flex items-start justify-between mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                  <Users className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">Lead Pipeline</h1>
                  <p className="text-base text-muted-foreground/80 mt-1.5">{filtered.length} of {leads.length} leads</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowCreate(true)} size="lg" className="rounded-xl px-6 shadow-lg hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300">
              <Plus className="w-5 h-5 mr-2" /> New Lead
            </Button>
          </div>

          {/* Filters - Premium Design */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
              <Input
                placeholder="Search by name, email, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 rounded-xl bg-card/50 border-border/50 backdrop-blur-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 h-12 rounded-xl bg-card/50 border-border/50 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map(s => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Premium Table */}
      <div className="px-8 py-8 max-w-[90rem] mx-auto">
        <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-muted/30 to-muted/10 border-b border-border/30">
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Lead</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Contact</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Source</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Value</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Follow Up</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-20 text-center text-muted-foreground">Loading leads...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-20 text-center text-muted-foreground">No leads found</td></tr>
                ) : filtered.map(lead => (
                  <tr key={lead.id} onClick={() => navigate(`/LeadDetail/${lead.id}`)} className="border-b border-border/20 hover:bg-muted/20 transition-all duration-200 cursor-pointer group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/5">
                          <span className="text-base font-bold text-accent">{(lead.firstName || 'U')[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm group-hover:text-accent transition-colors">{lead.fullName || `${lead.firstName} ${lead.lastName}`}</p>
                          {lead.tags?.length > 0 && (
                            <div className="flex gap-1.5 mt-1.5">
                              {lead.tags.slice(0, 2).map(t => (
                                <span key={t} className="text-[9px] px-2 py-0.5 rounded-md bg-muted/50 border border-border/30 font-medium">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1.5">
                        {lead.email && (
                          <div className="flex items-center gap-2 text-sm text-foreground/80">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground/50" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                            <Phone className="w-3 h-3" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-sm font-medium capitalize">{sourceLabels[lead.source] || lead.source}</span>
                    </td>
                    <td className="px-6 py-6">
                      <Badge className={`text-[11px] px-3 py-1 capitalize border ${statusColors[lead.status] || ''}`}>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <span className="text-lg font-bold">{lead.valueEstimate ? `$${lead.valueEstimate.toLocaleString()}` : '—'}</span>
                    </td>
                    <td className="px-6 py-6">
                      {lead.nextFollowUpAt ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{format(new Date(lead.nextFollowUpAt), 'MMM d, yyyy')}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Premium Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-xl border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add New Lead</DialogTitle>
            <p className="text-sm text-muted-foreground/80 mt-1">Create a new lead opportunity</p>
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
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Source</Label>
                <Select value={form.source} onValueChange={v => setForm({ ...form, source: v })}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(sourceLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
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
            <Button onClick={() => createMut.mutate(form)} disabled={!form.firstName || createMut.isPending || !activeOrgId} className="w-full h-12 rounded-xl text-base font-semibold shadow-lg hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300">
              <UserPlus className="w-5 h-5 mr-2" /> Create Lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}