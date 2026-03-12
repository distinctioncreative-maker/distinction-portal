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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Calendar as CalendarIcon, Video, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { toast } from 'sonner';

const typeColors = {
  call: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  meeting: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  demo: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  followup: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  onboarding: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  other: 'bg-muted text-muted-foreground border-muted',
};

export default function CalendarPage() {
  const { activeOrgId } = useOrg();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreate, setShowCreate] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'call', startAt: '', endAt: '', location: '', description: '' });

  const { data: appointments } = useQuery({
    queryKey: ['appointments', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.Appointment.filter({ organizationId: activeOrgId }, '-startAt', 200) : [],
    initialData: [],
  });

  const createMut = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        organizationId: activeOrgId,
        status: 'scheduled',
        assignedToUserId: user?.id,
        startAt: data.startAt ? new Date(data.startAt).toISOString() : null,
        endAt: data.endAt ? new Date(data.endAt).toISOString() : null,
      };
      return editingAppt
        ? base44.entities.Appointment.update(editingAppt.id, payload)
        : base44.entities.Appointment.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      setShowCreate(false);
      setEditingAppt(null);
      setForm({ title: '', type: 'call', startAt: '', endAt: '', location: '', description: '' });
      toast.success(editingAppt ? 'Appointment updated' : 'Appointment created');
    },
    onError: (error) => {
      toast.error('Failed to save appointment');
      console.error(error);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Appointment.update(id, { status: 'cancelled' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment cancelled');
    },
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = monthStart.getDay();
  const paddedDays = [...Array(startPad).fill(null), ...days];

  const selectedAppts = appointments.filter(a => a.startAt && isSameDay(new Date(a.startAt), selectedDate) && a.status !== 'cancelled');

  const handleEdit = (appt) => {
    setEditingAppt(appt);
    setForm({
      title: appt.title || '',
      type: appt.type || 'call',
      startAt: appt.startAt ? format(new Date(appt.startAt), "yyyy-MM-dd'T'HH:mm") : '',
      endAt: appt.endAt ? format(new Date(appt.endAt), "yyyy-MM-dd'T'HH:mm") : '',
      location: appt.location || '',
      description: appt.description || '',
    });
    setShowCreate(true);
  };

  return (
    <div className="min-h-screen">
      {/* Premium Header */}
      <div className="relative px-8 pt-12 pb-10 border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.05),transparent_50%)]" />
        <div className="relative max-w-[90rem] mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                  <CalendarIcon className="w-7 h-7 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">Calendar</h1>
                  <p className="text-base text-muted-foreground/80 mt-1.5">{appointments.filter(a => a.status !== 'cancelled').length} scheduled appointments</p>
                </div>
              </div>
            </div>
            <Button onClick={() => { setEditingAppt(null); setShowCreate(true); }} size="lg" className="rounded-xl px-6 shadow-lg hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300">
              <Plus className="w-5 h-5 mr-2" /> New Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="px-8 py-8 max-w-[90rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-xl">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }} className="rounded-xl px-4">
                    Today
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-xl">
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70 py-3">{d}</div>
                ))}
                {paddedDays.map((day, i) => {
                  if (!day) return <div key={`pad-${i}`} className="h-16" />;
                  const dayAppts = appointments.filter(a => a.startAt && isSameDay(new Date(a.startAt), day) && a.status !== 'cancelled');
                  const selected = isSameDay(day, selectedDate);
                  const today = isToday(day);

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(day)}
                      className={`h-16 rounded-xl text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1 group relative
                        ${selected ? 'bg-accent text-accent-foreground font-bold shadow-lg scale-105' : today ? 'bg-muted/50 font-semibold border border-border/50' : 'hover:bg-muted/30 border border-transparent hover:border-border/30'}
                        ${!isSameMonth(day, currentMonth) ? 'text-muted-foreground/30' : ''}`}
                    >
                      {format(day, 'd')}
                      {dayAppts.length > 0 && (
                        <div className="flex gap-0.5">
                          {dayAppts.slice(0, 3).map((_, j) => (
                            <div key={j} className={`w-1 h-1 rounded-full ${selected ? 'bg-accent-foreground' : 'bg-accent shadow-sm shadow-accent/50'}`} />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Selected Day Appointments */}
          <div>
            <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl h-full">
              <h3 className="text-base font-bold mb-1">{format(selectedDate, 'EEEE, MMMM d')}</h3>
              <p className="text-xs text-muted-foreground/70 mb-6">{selectedAppts.length} {selectedAppts.length === 1 ? 'appointment' : 'appointments'}</p>
              <div className="space-y-3">
                {selectedAppts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-center mx-auto mb-3">
                      <CalendarIcon className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-xs text-muted-foreground/70">No appointments</p>
                  </div>
                )}
                {selectedAppts.map(appt => (
                  <div key={appt.id} className="p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/30 hover:from-muted/60 hover:to-muted/30 transition-all duration-200 cursor-pointer group" onClick={() => handleEdit(appt)}>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`text-[10px] px-2 py-1 border capitalize ${typeColors[appt.type] || ''}`}>
                        {appt.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); deleteMut.mutate(appt.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1 h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-semibold mb-2 group-hover:text-accent transition-colors">{appt.title}</p>
                    {appt.startAt && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(appt.startAt), 'h:mm a')}</span>
                        {appt.endAt && <><span>—</span><span>{format(new Date(appt.endAt), 'h:mm a')}</span></>}
                      </div>
                    )}
                    {appt.location && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{appt.location}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Premium Create/Edit Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) setEditingAppt(null); }}>
        <DialogContent className="max-w-2xl border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{editingAppt ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
            <p className="text-sm text-muted-foreground/80 mt-1">{editingAppt ? 'Update appointment details' : 'Schedule a new appointment'}</p>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Title</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Client Discovery Call" className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['call', 'meeting', 'demo', 'followup', 'onboarding', 'other'].map(t => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Start</Label>
                <Input type="datetime-local" value={form.startAt} onChange={e => setForm({ ...form, startAt: e.target.value })} className="h-11 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">End</Label>
                <Input type="datetime-local" value={form.endAt} onChange={e => setForm({ ...form, endAt: e.target.value })} className="h-11 rounded-xl" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Location</Label>
              <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location or video link" className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Add notes..." rows={2} className="rounded-xl" />
            </div>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.title || !form.startAt || createMut.isPending} className="w-full h-12 rounded-xl text-base font-semibold shadow-lg hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300">
              <Video className="w-5 h-5 mr-2" /> {editingAppt ? 'Update Appointment' : 'Create Appointment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}