import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { UserPlus, ListPlus, CalendarPlus, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { tasksApi } from '@/api/tasks';
import { useOrg } from '../OrgContext';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const actions = [
  { label: 'New Lead', icon: UserPlus, path: '/Leads', color: 'text-blue-400', entity: 'Lead' },
  { label: 'New Task', icon: ListPlus, path: '/Tasks', color: 'text-emerald-400', entity: 'Task' },
  { label: 'Book Call', icon: CalendarPlus, path: '/Calendar', color: 'text-violet-400', entity: 'Appointment' },
  { label: 'AI Insights', icon: Sparkles, path: '/Metrics', color: 'text-amber-400', entity: null },
];

export default function QuickActionsEnhanced() {
  const { activeOrgId } = useOrg();
  const [hoveredAction, setHoveredAction] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const { data: leads } = useQuery({
    queryKey: ['leads', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.Lead.filter({ organizationId: activeOrgId }, '-created_date', 5) : [],
    initialData: [],
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks', activeOrgId],
    queryFn: () => activeOrgId ? tasksApi.list(activeOrgId, { status: 'todo' }) : [],
    initialData: [],
  });

  const { data: appointments } = useQuery({
    queryKey: ['appointments', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.Appointment.filter({ organizationId: activeOrgId, status: 'scheduled' }, '-startAt', 5) : [],
    initialData: [],
  });

  const handleMouseEnter = (actionLabel) => {
    const timeout = setTimeout(() => {
      setHoveredAction(actionLabel);
    }, 800);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setHoveredAction(null);
  };

  const getPreviewData = (actionLabel) => {
    if (actionLabel === 'New Lead') return leads.slice(0, 3);
    if (actionLabel === 'New Task') return tasks.slice(0, 3);
    if (actionLabel === 'Book Call') return appointments.slice(0, 3);
    return [];
  };

  const renderPreviewContent = (action) => {
    const data = getPreviewData(action.label);
    if (!data || data.length === 0) return <p className="text-[10px] text-muted-foreground/60">No recent items</p>;

    if (action.label === 'New Lead') {
      return (
        <div className="space-y-2">
          {data.map((lead, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50" />
              <p className="text-[11px] font-medium truncate">{lead.fullName || `${lead.firstName} ${lead.lastName}`}</p>
            </div>
          ))}
        </div>
      );
    }

    if (action.label === 'New Task') {
      return (
        <div className="space-y-2">
          {data.map((task, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <p className="text-[11px] font-medium truncate">{task.title}</p>
            </div>
          ))}
        </div>
      );
    }

    if (action.label === 'Book Call') {
      return (
        <div className="space-y-2">
          {data.map((appt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50" />
              <p className="text-[11px] font-medium truncate">
                {appt.title} {appt.startAt && `• ${format(new Date(appt.startAt), 'MMM d')}`}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-base font-bold tracking-tight">Actions</h3>
        <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-[0.15em]">Quick Access</p>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        {actions.map(a => (
          <div
            key={a.label}
            className="relative"
            onMouseEnter={() => handleMouseEnter(a.label)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              to={a.path}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 hover:from-muted/60 hover:to-muted/30 transition-all duration-300 border border-border/30 hover:border-border/50 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className={`p-2.5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/30 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                <a.icon className={`w-5 h-5 ${a.color}`} />
              </div>
              <span className="text-[11px] font-semibold text-center relative z-10">{a.label}</span>
            </Link>

            <AnimatePresence>
              {hoveredAction === a.label && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="absolute left-full top-0 ml-3 z-50 w-56 pointer-events-none"
                >
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-card/95 via-card/90 to-card/85 backdrop-blur-2xl border border-border/50 shadow-2xl shadow-accent/10">
                    <div className="absolute -left-2 top-4 w-4 h-4 bg-card/95 border-l border-t border-border/50 rotate-45 backdrop-blur-2xl" />
                    <div className="relative">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70 mb-3">
                        Recent {a.label === 'New Lead' ? 'Leads' : a.label === 'New Task' ? 'Tasks' : a.label === 'Book Call' ? 'Appointments' : 'Items'}
                      </p>
                      {renderPreviewContent(a)}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </Card>
  );
}