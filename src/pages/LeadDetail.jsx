import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tantml:function_calls>';
import { useOrg } from '@/components/OrgContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Phone, Calendar, CheckSquare, Activity as ActivityIcon } from 'lucide-react';
import { format } from 'date-fns';
import EmptyState from '@/components/dashboard/EmptyState';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeOrgId } = useOrg();
  const qc = useQueryClient();

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const leads = await base44.entities.Lead.filter({ id, organizationId: activeOrgId });
      return leads[0] || null;
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ['leadTasks', id],
    queryFn: () => base44.entities.Task.filter({ relatedLeadId: id, organizationId: activeOrgId }),
    initialData: [],
  });

  const { data: appointments } = useQuery({
    queryKey: ['leadAppointments', id],
    queryFn: () => base44.entities.Appointment.filter({ leadId: id, organizationId: activeOrgId }),
    initialData: [],
  });

  const { data: activities } = useQuery({
    queryKey: ['leadActivities', id],
    queryFn: () => base44.entities.ActivityLog.filter({ entityId: id, organizationId: activeOrgId }, '-created_date', 50),
    initialData: [],
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!lead) return <div className="p-6">Lead not found</div>;

  const statusColors = {
    new: 'bg-blue-500/10 text-blue-500',
    contacted: 'bg-cyan-500/10 text-cyan-500',
    qualified: 'bg-emerald-500/10 text-emerald-500',
    proposal: 'bg-amber-500/10 text-amber-500',
    won: 'bg-green-500/10 text-green-500',
    lost: 'bg-red-500/10 text-red-500',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/Leads')} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{lead.fullName || `${lead.firstName} ${lead.lastName}`}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge className={statusColors[lead.status] || ''}>{lead.status}</Badge>
            <span className="text-sm text-muted-foreground">{lead.source}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Info */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {lead.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{lead.phone}</span>
              </div>
            )}
            {lead.valueEstimate > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Est. Value</p>
                <p className="text-2xl font-bold mt-1">${lead.valueEstimate.toLocaleString()}</p>
              </div>
            )}
            {lead.notes && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Notes</p>
                <p className="text-sm">{lead.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Tabs */}
        <Card className="lg:col-span-2">
          <Tabs defaultValue="tasks" className="w-full">
            <CardHeader className="pb-3">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
                <TabsTrigger value="appointments">Appointments ({appointments.length})</TabsTrigger>
                <TabsTrigger value="activity">Activity ({activities.length})</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="tasks" className="mt-0">
                {tasks.length === 0 ? (
                  <EmptyState icon={CheckSquare} title="No tasks" description="Create a task for this lead" />
                ) : (
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div key={task.id} className="p-3 rounded-xl bg-muted/30 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.priority}</p>
                        </div>
                        <Badge variant="outline">{task.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="appointments" className="mt-0">
                {appointments.length === 0 ? (
                  <EmptyState icon={Calendar} title="No appointments" description="Schedule an appointment with this lead" />
                ) : (
                  <div className="space-y-2">
                    {appointments.map(appt => (
                      <div key={appt.id} className="p-3 rounded-xl bg-muted/30">
                        <p className="text-sm font-medium">{appt.title}</p>
                        <p className="text-xs text-muted-foreground">{appt.startAt && format(new Date(appt.startAt), 'MMM d, h:mm a')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="activity" className="mt-0">
                {activities.length === 0 ? (
                  <EmptyState icon={ActivityIcon} title="No activity" description="Activity will appear here" />
                ) : (
                  <div className="space-y-2">
                    {activities.map(act => (
                      <div key={act.id} className="p-3 rounded-xl bg-muted/30">
                        <p className="text-sm">{act.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{act.created_date && format(new Date(act.created_date), 'MMM d, h:mm a')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}