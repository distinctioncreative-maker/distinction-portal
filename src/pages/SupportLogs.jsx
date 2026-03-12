import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, FileText } from 'lucide-react';
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
    queryFn: () => base44.entities.SupportSession.list('-created_date', 100),
    initialData: [],
  });

  const { data: actionLogs } = useQuery({
    queryKey: ['allSupportActionLogs'],
    queryFn: () => base44.entities.SupportActionLog.list('-created_date', 100),
    initialData: [],
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Session Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Audit trail of all support access</p>
      </div>

      {/* Sessions */}
      <Card>
        <CardHeader><CardTitle className="text-base">Sessions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Support User</TableHead>
                <TableHead className="font-semibold">Organization</TableHead>
                <TableHead className="font-semibold">Reason</TableHead>
                <TableHead className="font-semibold">Mode</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Entered</TableHead>
                <TableHead className="font-semibold">Exited</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">No sessions found</TableCell></TableRow>
              ) : sessions.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="text-xs">{s.supportUserId || '—'}</TableCell>
                  <TableCell className="text-xs">{s.organizationId || '—'}</TableCell>
                  <TableCell className="text-xs max-w-48 truncate">{s.accessReason}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{s.mode}</Badge></TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${s.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : s.status === 'ended' ? 'bg-muted text-muted-foreground' : 'bg-amber-500/10 text-amber-500'}`}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{s.enteredAt ? format(new Date(s.enteredAt), 'MMM d, h:mm a') : '—'}</TableCell>
                  <TableCell className="text-xs">{s.exitedAt ? format(new Date(s.exitedAt), 'MMM d, h:mm a') : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Logs */}
      <Card>
        <CardHeader><CardTitle className="text-base">Action Logs</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Action</TableHead>
                <TableHead className="font-semibold">Entity</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actionLogs.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">No action logs</TableCell></TableRow>
              ) : actionLogs.map(l => (
                <TableRow key={l.id}>
                  <TableCell><Badge variant="outline" className="text-[10px]">{l.actionType}</Badge></TableCell>
                  <TableCell className="text-xs">{l.entityType || '—'}</TableCell>
                  <TableCell className="text-xs max-w-64 truncate">{l.description || '—'}</TableCell>
                  <TableCell className="text-xs">{l.created_date ? format(new Date(l.created_date), 'MMM d, h:mm a') : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}