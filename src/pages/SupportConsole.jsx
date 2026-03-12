import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Shield, Search, Building2, Users, ArrowRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SupportConsole() {
  const { user } = useAuth();
  const { isSupportMode, supportMode, enterSupportMode, exitSupportMode, userRole } = useOrg();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [reason, setReason] = useState('');
  const [showEnter, setShowEnter] = useState(false);

  // Guard: only support/superadmin
  if (!['support', 'superadmin'].includes(userRole)) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-20">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-1">This area is restricted to internal support staff.</p>
      </div>
    );
  }

  const { data: orgs } = useQuery({
    queryKey: ['allOrgs'],
    queryFn: () => base44.entities.Organization.list('-created_date', 200),
    initialData: [],
  });

  const { data: recentSessions } = useQuery({
    queryKey: ['recentSupportSessions', user?.id],
    queryFn: () => user?.id ? base44.entities.SupportSession.filter({ supportUserId: user.id }, '-created_date', 10) : [],
    initialData: [],
  });

  const filtered = orgs.filter(o => !search || o.name?.toLowerCase().includes(search.toLowerCase()) || o.slug?.toLowerCase().includes(search.toLowerCase()));

  const handleEnterSupport = async () => {
    if (!selectedOrg || !reason.trim()) return;
    await enterSupportMode(selectedOrg.id, selectedOrg.name, reason);
    setShowEnter(false);
    setReason('');
    navigate('/Dashboard');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Console</h1>
        <p className="text-sm text-muted-foreground mt-1">Access client organizations for troubleshooting</p>
      </div>

      {/* Current Support Mode */}
      {isSupportMode && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-amber-500">Active Support Session</p>
                <p className="text-xs text-muted-foreground">Viewing: {supportMode.orgName} — {supportMode.reason}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={exitSupportMode}>Exit Support Mode</Button>
          </CardContent>
        </Card>
      )}

      {/* Warning */}
      <Card className="border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-500">Support Access Guidelines</p>
            <p className="text-xs text-muted-foreground mt-1">All support sessions are logged and audited. Access is read-only by default. Provide a clear reason before entering any client account.</p>
          </div>
        </div>
      </Card>

      {/* Search Organizations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organizations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search organizations..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filtered.map(org => (
              <div key={org.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{org.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px]">{org.status || 'active'}</Badge>
                      <span className="text-[10px] text-muted-foreground">{org.planType || 'starter'}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setSelectedOrg(org); setShowEnter(true); }}
                >
                  Enter <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Support Sessions</CardTitle></CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No recent sessions</p>
          ) : (
            <div className="space-y-2">
              {recentSessions.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-xs font-medium">Org: {s.organizationId}</p>
                    <p className="text-[10px] text-muted-foreground">{s.accessReason}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${s.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : ''}`}>{s.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enter Support Mode Dialog */}
      <Dialog open={showEnter} onOpenChange={setShowEnter}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Enter Support Mode</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium">{selectedOrg?.name}</p>
              <p className="text-xs text-muted-foreground">ID: {selectedOrg?.id}</p>
            </div>
            <div>
              <Label className="text-xs">Reason for Access *</Label>
              <Textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Describe the support reason..."
                rows={3}
              />
              <p className="text-[10px] text-muted-foreground mt-1">This will be logged in the audit trail</p>
            </div>
            <Button onClick={handleEnterSupport} disabled={!reason.trim()} className="w-full">
              <Shield className="w-4 h-4 mr-1.5" /> Enter Support Mode
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}