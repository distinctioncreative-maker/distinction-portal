import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import MetricCard from '@/components/dashboard/MetricCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import PipelineSummary from '@/components/dashboard/PipelineSummary';
import RecentActivity from '@/components/dashboard/RecentActivity';
import TasksDueWidget from '@/components/dashboard/TasksDueWidget';
import QuickActions from '@/components/dashboard/QuickActions';
import { DollarSign, TrendingUp, Users, Phone, Target, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const { activeOrgId } = useOrg();

  const { data: metrics } = useQuery({
    queryKey: ['metrics', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.DailyMetric.filter({ organizationId: activeOrgId }, '-date', 30) : [],
    initialData: [],
  });

  const { data: leads } = useQuery({
    queryKey: ['leads', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.Lead.filter({ organizationId: activeOrgId }, '-created_date', 50) : [],
    initialData: [],
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.Task.filter({ organizationId: activeOrgId }, '-created_date', 50) : [],
    initialData: [],
  });

  const { data: stages } = useQuery({
    queryKey: ['stages', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.PipelineStage.filter({ organizationId: activeOrgId }) : [],
    initialData: [],
  });

  const { data: pipelineItems } = useQuery({
    queryKey: ['pipelineItems', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.PipelineItem.filter({ organizationId: activeOrgId }) : [],
    initialData: [],
  });

  const { data: activities } = useQuery({
    queryKey: ['activities', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.ActivityLog.filter({ organizationId: activeOrgId }, '-created_date', 10) : [],
    initialData: [],
  });

  const latest = metrics[0] || {};
  const fmt = (n) => n ? `$${Number(n).toLocaleString()}` : '$0';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your business at a glance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard title="Revenue Today" value={fmt(latest.revenueDaily)} icon={DollarSign} trend="up" trendLabel="Daily" />
        <MetricCard title="Revenue MTD" value={fmt(latest.revenueMTD)} icon={TrendingUp} subtitle="Month to date" />
        <MetricCard title="Revenue YTD" value={fmt(latest.revenueYTD)} icon={BarChart3} subtitle="Year to date" />
        <MetricCard title="Leads Today" value={latest.leadsDaily || 0} icon={Users} trend="up" trendLabel="New" />
        <MetricCard title="Leads MTD" value={latest.leadsMTD || 0} icon={Target} subtitle="This month" />
        <MetricCard title="Booked Calls" value={latest.bookedCallsDaily || 0} icon={Phone} subtitle="Today" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueChart metrics={metrics} />
        <PipelineSummary stages={stages} items={pipelineItems} />
      </div>

      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TasksDueWidget tasks={tasks} />
        <RecentActivity activities={activities} />
        <QuickActions />
      </div>
    </div>
  );
}