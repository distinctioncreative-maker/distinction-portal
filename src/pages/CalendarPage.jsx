import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';

const typeColors = {
  call: 'bg-blue-500/10 text-blue-500', meeting: 'bg-violet-500/10 text-violet-500',
  demo: 'bg-amber-500/10 text-amber-500', followup: 'bg-cyan-500/10 text-cyan-500',
  onboarding: 'bg-emerald-500/10 text-emerald-500', other: 'bg-muted text-muted-foreground',
};

export default function CalendarPage() {
  const { activeOrgId } = useOrg();
  const qc = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'call', startAt: '', endAt: '', location: '', description: '' });

  const { data: appointments } = useQuery({
    queryKey: ['appointments', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.Appointment.filter({ organizationId: activeOrgId }, '-startAt', 200) : [],
    initialData: [],
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create({ ...data, organizationId: activeOrgId, status: 'scheduled' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); setShowCreate(false); },
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad to start on Sunday
  const startPad = monthStart.getDay();
  const paddedDays = [...Array(startPad).fill(null), ...days];

  const selectedAppts = appointments.filter(a => a.startAt && isSameDay(new Date(a.startAt), selectedDate));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">{appointments.length} appointments</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm"><Plus className="w-4 h-4 mr-1.5" /> New Appointment</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }}>Today</Button>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2">{d}</div>
            ))}
            {paddedDays.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} className="h-12" />;
              const dayAppts = appointments.filter(a => a.startAt && isSameDay(new Date(a.startAt), day));
              const selected = isSameDay(day, selectedDate);
              const today = isToday(day);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`h-12 rounded-lg text-sm transition-all flex flex-col items-center justify-center gap-0.5
                    ${selected ? 'bg-accent text-accent-foreground font-semibold' : today ? 'bg-muted font-medium' : 'hover:bg-muted/50'}
                    ${!isSameMonth(day, currentMonth) ? 'text-muted-foreground/40' : ''}`}
                >
                  {format(day, 'd')}
                  {dayAppts.length > 0 && (
                    <div className="flex gap-0.5">
                      {dayAppts.slice(0, 3).map((_, j) => <div key={j} className="w-1 h-1 rounded-full bg-accent" />)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected Day */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">{format(selectedDate, 'EEEE, MMMM d')}</h3>
          <div className="space-y-3">
            {selectedAppts.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No appointments</p>
            )}
            {selectedAppts.map(appt => (
              <div key={appt.id} className="p-3 rounded-lg bg-muted/30 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge className={`text-[10px] ${typeColors[appt.type] || ''}`}>{appt.type}</Badge>
                  <span className="text-xs font-medium">{appt.title}</span>
                </div>
                {appt.startAt && (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" /> {format(new Date(appt.startAt), 'h:mm a')}
                    {appt.endAt && <> — {format(new Date(appt.endAt), 'h:mm a')}</>}
                  </div>
                )}
                {appt.location && (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {appt.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Appointment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['call', 'meeting', 'demo', 'followup', 'onboarding', 'other'].map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Start</Label><Input type="datetime-local" value={form.startAt} onChange={e => setForm({ ...form, startAt: e.target.value })} /></div>
              <div><Label className="text-xs">End</Label><Input type="datetime-local" value={form.endAt} onChange={e => setForm({ ...form, endAt: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">Location</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.title || !form.startAt || createMut.isPending} className="w-full">Create Appointment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}