import React from 'react';
import { supportSessionsApi } from '@/api/supportSessions';
import { useQuery } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function SupportLogs() {
  const { userRole } = useOrg();

  if (!['support', 'superadmin'].includes(userRole)) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-20">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold">Access Denied</h2>
      </div>
    );
  }

  const { data: sessions } = useQuery({
    queryKey: ['allSupportSessions'],
    queryFn: () => supportSessionsApi.list(100),
    initialData: [],
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Session Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Audit trail of all support access</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Sessions ({sessions.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Support User</TableHead>
                <TableHead className="font-semibold">Organization</TableHead>
                <TableHead className="font-semibold">Reason</TableHead>
                <TableHead className="font-semibold">Mode</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Started</TableHead>
                <TableHead className="font-semibold">Ended</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">No sessions found</TableCell></TableRow>
              ) : sessions.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="text-xs font-mono">{s.supportUserId?.slice(0, 8)}…</TableCell>
                  <TableCell className="text-xs font-mono">{s.organizationId?.slice(0, 8)}…</TableCell>
                  <TableCell className="text-xs max-w-48 truncate">{s.reason || '—'}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{s.mode}</Badge></TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${s.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : s.status === 'ended' ? 'bg-muted text-muted-foreground' : 'bg-amber-500/10 text-amber-500'}`}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{s.startedAt ? format(new Date(s.startedAt), 'MMM d, h:mm a') : '—'}</TableCell>
                  <TableCell className="text-xs">{s.endedAt ? format(new Date(s.endedAt), 'MMM d, h:mm a') : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
