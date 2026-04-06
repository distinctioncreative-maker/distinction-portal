import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { tasksApi } from '@/api/tasks';
import { useQuery } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import MetricCard from '@/components/dashboard/MetricCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import PipelineSummary from '@/components/dashboard/PipelineSummary';
import RecentActivity from '@/components/dashboard/RecentActivity';
import TasksDueWidget from '@/components/dashboard/TasksDueWidget';
import QuickActionsEnhanced from '@/components/dashboard/QuickActionsEnhanced';
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
    queryFn: () => activeOrgId ? tasksApi.list(activeOrgId) : [],
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
    <div className="min-h-screen">
      {/* Hero Section - Cinematic Header */}
      <div className="relative px-8 pt-12 pb-16 border-b border-border/30 bg-gradient-to-b from-background via-background to-background/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,200,100,0.05),transparent_50%)]" />
        <div className="relative max-w-[90rem] mx-auto">
          <div className="space-y-2 mb-12">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text">
              Command Center
            </h1>
            <p className="text-base text-muted-foreground/80">Real-time business intelligence</p>
          </div>

          {/* Hero Metrics - Asymmetric Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Primary Hero Metric */}
            <div className="col-span-12 lg:col-span-5">
              <Link to="/Financials" className="block">
                <div className="relative group cursor-pointer">
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 via-accent/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  <div className="relative p-8 rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl overflow-hidden group-hover:shadow-2xl group-hover:shadow-accent/10 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all duration-500" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 shadow-lg shadow-accent/10 group-hover:scale-110 transition-transform duration-300">
                          <DollarSign className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 font-bold">Revenue Today</p>
                          <p className="text-[10px] text-accent/70 font-semibold">Live Performance</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-6xl font-bold tracking-tight">{fmt(latest.revenueDaily)}</p>
                        <div className="flex items-center gap-6 pt-4 border-t border-border/30">
                          <div>
                            <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-1">MTD</p>
                            <p className="text-xl font-bold">{fmt(latest.revenueMTD)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-1">YTD</p>
                            <p className="text-xl font-bold">{fmt(latest.revenueYTD)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Secondary Metrics Grid */}
            <div className="col-span-12 lg:col-span-7">
              <div className="grid grid-cols-2 gap-4 h-full">
                <Link to="/Leads" className="block">
                  <div className="p-6 rounded-2xl border border-border/50 bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group cursor-pointer h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300">
                        <Users className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold mb-2">New Leads</p>
                    <p className="text-4xl font-bold mb-1">{latest.leadsDaily || 0}</p>
                    <p className="text-xs text-muted-foreground/70">{latest.leadsMTD || 0} this month</p>
                  </div>
                </Link>

                <Link to="/CalendarPage" className="block">
                  <div className="p-6 rounded-2xl border border-border/50 bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 group cursor-pointer h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300">
                        <Phone className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold mb-2">Booked Calls</p>
                    <p className="text-4xl font-bold mb-1">{latest.bookedCallsDaily || 0}</p>
                    <p className="text-xs text-muted-foreground/70">{latest.bookedCallsMTD || 0} this month</p>
                  </div>
                </Link>

                <Link to="/Metrics" className="col-span-2 block">
                  <div className="p-6 rounded-2xl border border-border/50 bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold mb-2">Conversion Rate</p>
                        <p className="text-3xl font-bold">{(latest.conversionRateDaily || 0).toFixed(1)}%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-violet-500/20 transition-all duration-300">
                        <Target className="w-6 h-6 text-violet-400" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Immersive Layout */}
      <div className="px-8 py-12 max-w-[90rem] mx-auto space-y-8">
        {/* Charts - Premium Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <RevenueChart metrics={metrics} />
          </div>
          <div className="lg:col-span-2">
            <PipelineSummary stages={stages} items={pipelineItems} />
          </div>
        </div>

        {/* Activity & Actions - Refined Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
          <div className="lg:col-span-3">
            <TasksDueWidget tasks={tasks} />
          </div>
          <div className="lg:col-span-3">
            <RecentActivity activities={activities} />
          </div>
          <div className="lg:col-span-1">
            <QuickActionsEnhanced />
          </div>
        </div>
      </div>
    </div>
  );
}