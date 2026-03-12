import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Mail, Phone, Calendar, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  new: 'bg-blue-500/10 text-blue-500', contacted: 'bg-cyan-500/10 text-cyan-500',
  qualified: 'bg-emerald-500/10 text-emerald-500', proposal: 'bg-violet-500/10 text-violet-500',
  negotiation: 'bg-amber-500/10 text-amber-500', won: 'bg-emerald-500/10 text-emerald-500',
  lost: 'bg-red-500/10 text-red-500', archived: 'bg-muted text-muted-foreground',
};

const sourceLabels = { website: 'Website', referral: 'Referral', social_media: 'Social', cold_outreach: 'Outreach', paid_ads: 'Paid Ads', organic: 'Organic', partner: 'Partner', event: 'Event', other: 'Other' };

export default function Leads() {
  const { activeOrgId } = useOrg();
  const qc = useQueryClient();
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); setShowCreate(false); setForm({ firstName: '', lastName: '', email: '', phone: '', source: 'website', status: 'new', valueEstimate: 0, notes: '' }); },
  });

  const filtered = leads.filter(l => {
    const matchSearch = !search || [l.fullName, l.firstName, l.lastName, l.email, l.phone].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">{leads.length} total leads</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm"><Plus className="w-4 h-4 mr-1.5" /> New Lead</Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map(s => (
                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold">Source</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Value</TableHead>
              <TableHead className="font-semibold">Follow Up</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No leads found</TableCell></TableRow>
            ) : filtered.map(lead => (
              <TableRow key={lead.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{lead.fullName || `${lead.firstName} ${lead.lastName}`}</p>
                    {lead.tags?.length > 0 && (
                      <div className="flex gap-1 mt-1">{lead.tags.slice(0, 2).map(t => <Badge key={t} variant="outline" className="text-[10px] py-0">{t}</Badge>)}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    {lead.email && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{lead.email}</div>}
                    {lead.phone && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{lead.phone}</div>}
                  </div>
                </TableCell>
                <TableCell><span className="text-xs">{sourceLabels[lead.source] || lead.source}</span></TableCell>
                <TableCell><Badge className={`text-[10px] ${statusColors[lead.status] || ''}`}>{lead.status}</Badge></TableCell>
                <TableCell className="text-right font-medium text-sm">{lead.valueEstimate ? `$${lead.valueEstimate.toLocaleString()}` : '—'}</TableCell>
                <TableCell>
                  {lead.nextFollowUpAt ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="w-3 h-3" />{format(new Date(lead.nextFollowUpAt), 'MMM d')}</div>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">First Name</Label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
              <div><Label className="text-xs">Last Name</Label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Source</Label>
                <Select value={form.source} onValueChange={v => setForm({ ...form, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(sourceLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Est. Value</Label><Input type="number" value={form.valueEstimate} onChange={e => setForm({ ...form, valueEstimate: Number(e.target.value) })} /></div>
            </div>
            <div><Label className="text-xs">Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.firstName || createMut.isPending} className="w-full">
              <UserPlus className="w-4 h-4 mr-1.5" /> Create Lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}