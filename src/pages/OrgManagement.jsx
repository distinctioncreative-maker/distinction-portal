import React, { useState } from 'react';
import { organizationsApi } from '@/api/orgSettings';
import { supportSessionsApi } from '@/api/supportSessions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield, Building2, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function OrgManagement() {
  const { userRole } = useOrg();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', businessType: 'services', planType: 'starter' });
  const [tab, setTab] = useState('orgs');

  if (userRole !== 'superadmin') {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-20">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold">Superadmin Access Required</h2>
      </div>
    );
  }

  const { data: orgs } = useQuery({
    queryKey: ['allOrgs'],
    queryFn: () => organizationsApi.listAll(200),
    initialData: [],
  });

  const { data: sessions } = useQuery({
    queryKey: ['allSupportSessions'],
    queryFn: () => supportSessionsApi.list(50),
    initialData: [],
  });

  const createMut = useMutation({
    mutationFn: (data) => organizationsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['allOrgs'] }); setShowCreate(false); setForm({ name: '', businessType: 'services', planType: 'starter' }); },
  });

  const toggleMut = useMutation({
    mutationFn: (org) => organizationsApi.toggleStatus(org),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['allOrgs'] }),
  });

  const filtered = orgs.filter(o => !search || o.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organization Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform administration</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm"><Plus className="w-4 h-4 mr-1.5" /> New Organization</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-xs text-muted-foreground uppercase tracking-wider">Total Orgs</p><p className="text-2xl font-bold mt-1">{orgs.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground uppercase tracking-wider">Active</p><p className="text-2xl font-bold mt-1">{orgs.filter(o => o.isActive).length}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground uppercase tracking-wider">Trial</p><p className="text-2xl font-bold mt-1">{orgs.filter(o => o.status === 'trial').length}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground uppercase tracking-wider">Support Sessions</p><p className="text-2xl font-bold mt-1">{sessions.length}</p></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="orgs">Organizations</TabsTrigger>
          <TabsTrigger value="sessions">Support Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="orgs" className="mt-4">
          <Card>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">Organization</TableHead>
                    <TableHead className="font-semibold">Plan</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">No organizations found</TableCell></TableRow>
                  ) : filtered.map(org => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{org.name}</p>
                            <p className="text-[10px] text-muted-foreground">{org.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{org.planType || 'starter'}</Badge></TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${org.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {org.status || (org.isActive ? 'active' : 'inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{org.createdDate ? format(new Date(org.createdDate), 'MMM d, yyyy') : '—'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => toggleMut.mutate(org)} className="text-xs">
                          {org.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">Org ID</TableHead>
                    <TableHead className="font-semibold">Reason</TableHead>
                    <TableHead className="font-semibold">Mode</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">No sessions yet</TableCell></TableRow>
                  ) : sessions.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="text-xs font-mono">{s.organizationId?.slice(0, 8)}…</TableCell>
                      <TableCell className="text-xs max-w-48 truncate">{s.reason || '—'}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{s.mode}</Badge></TableCell>
                      <TableCell><Badge className={`text-[10px] ${s.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>{s.status}</Badge></TableCell>
                      <TableCell className="text-xs">{s.createdDate ? format(new Date(s.createdDate), 'MMM d, h:mm a') : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Organization</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div>
              <Label className="text-xs">Business Type</Label>
              <Select value={form.businessType} onValueChange={v => setForm({ ...form, businessType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['agency', 'consulting', 'coaching', 'saas', 'services', 'other'].map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Plan</Label>
              <Select value={form.planType} onValueChange={v => setForm({ ...form, planType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['starter', 'growth', 'scale', 'enterprise'].map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.name || createMut.isPending} className="w-full">Create Organization</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
