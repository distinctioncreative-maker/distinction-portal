import React, { useState } from 'react';
import { dailyMetricsApi } from '@/api/dailyMetrics';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, TrendingUp, PiggyBank, Target, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { toast } from 'sonner';

const today = new Date().toISOString().split('T')[0];

const defaultEntry = {
  date: today,
  revenueDaily: '', profitDaily: '',
  leadsDaily: '', bookedCallsDaily: '',
  revenueMTD: '', profitMTD: '', revenueYTD: '', profitYTD: '',
  leadsMTD: '', leadsYTD: '', bookedCallsMTD: '', bookedCallsYTD: '',
  conversionRateDaily: '',
};

export default function Financials() {
  const { activeOrgId } = useOrg();
  const qc = useQueryClient();
  const [showEntry, setShowEntry] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [entry, setEntry] = useState(defaultEntry);

  const { data: metrics } = useQuery({
    queryKey: ['dailyMetrics', activeOrgId],
    queryFn: () => activeOrgId ? dailyMetricsApi.list(activeOrgId, 90) : [],
    initialData: [],
  });

  const logMut = useMutation({
    mutationFn: () => {
      const nums = {};
      for (const [k, v] of Object.entries(entry)) {
        if (k === 'date') continue;
        nums[k] = v === '' ? 0 : Number(v);
      }
      return dailyMetricsApi.upsert(activeOrgId, entry.date, nums);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dailyMetrics'] });
      qc.invalidateQueries({ queryKey: ['metrics'] });
      setShowEntry(false);
      setEntry(defaultEntry);
      setShowAdvanced(false);
      toast.success('Metrics logged');
    },
    onError: (e) => { toast.error('Failed to save metrics'); console.error(e); },
  });

  const latestMetric = metrics[0] || {};
  const chartData = metrics.slice(0, 30).reverse().map(m => ({
    date: format(new Date(m.date), 'MMM d'),
    revenue: m.revenueDaily || 0,
    profit: m.profitDaily || 0,
  }));

  const totalRevenue = latestMetric.revenueYTD || 0;
  const totalProfit = latestMetric.profitYTD || 0;
  const monthlyRevenue = latestMetric.revenueMTD || 0;
  const monthlyProfit = latestMetric.profitMTD || 0;
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

  const field = (key, label, type = 'number', placeholder = '0') => (
    <div>
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">{label}</Label>
      <Input
        type={type}
        value={entry[key]}
        onChange={e => setEntry({ ...entry, [key]: e.target.value })}
        placeholder={placeholder}
        className="h-11 rounded-xl"
      />
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Premium Header */}
      <div className="relative px-8 pt-12 pb-10 border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,168,83,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.05),transparent_50%)]" />
        <div className="relative max-w-[90rem] mx-auto">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 shadow-lg shadow-accent/5">
                  <DollarSign className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">Financials</h1>
                  <p className="text-base text-muted-foreground/80 mt-1.5">Comprehensive financial overview and analytics</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowEntry(true)}
              size="lg"
              className="rounded-xl px-6 shadow-lg hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" /> Log Today's Numbers
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-[90rem] mx-auto space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">YTD Revenue</p>
                <p className="text-3xl font-bold tracking-tight mt-2">${(totalRevenue / 1000).toFixed(1)}k</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>MTD: ${(monthlyRevenue / 1000).toFixed(1)}k</span>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">YTD Profit</p>
                <p className="text-3xl font-bold tracking-tight mt-2">${(totalProfit / 1000).toFixed(1)}k</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <PiggyBank className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-blue-400">
              <TrendingUp className="w-4 h-4" />
              <span>MTD: ${(monthlyProfit / 1000).toFixed(1)}k</span>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Profit Margin</p>
                <p className="text-3xl font-bold tracking-tight mt-2">{profitMargin}%</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20">
                <Target className="w-5 h-5 text-violet-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground/70">Industry avg: 15-20%</p>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Daily Revenue</p>
                <p className="text-3xl font-bold tracking-tight mt-2">${((latestMetric.revenueDaily || 0) / 1000).toFixed(1)}k</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground/70">Last recorded day</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-base font-bold">Revenue Trend (30 Days)</CardTitle>
              <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-[0.15em]">Daily Performance</p>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} labelStyle={{ color: 'hsl(var(--foreground))' }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-base font-bold">Profit vs Revenue (30 Days)</CardTitle>
              <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-[0.15em]">Comparison</p>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} labelStyle={{ color: 'hsl(var(--foreground))' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="profit" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Log Metrics Dialog */}
      <Dialog open={showEntry} onOpenChange={(open) => { setShowEntry(open); if (!open) { setEntry(defaultEntry); setShowAdvanced(false); } }}>
        <DialogContent className="max-w-lg border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Log Today's Numbers</DialogTitle>
            <p className="text-sm text-muted-foreground/80 mt-1">Enter your daily performance metrics</p>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Date</Label>
              <Input type="date" value={entry.date} onChange={e => setEntry({ ...entry, date: e.target.value })} className="h-11 rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {field('revenueDaily', 'Revenue Today ($)')}
              {field('profitDaily', 'Profit Today ($)')}
              {field('leadsDaily', 'New Leads')}
              {field('bookedCallsDaily', 'Booked Calls')}
              {field('conversionRateDaily', 'Conversion Rate (%)')}
            </div>

            {/* Advanced toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(v => !v)}
              className="flex items-center gap-2 text-xs text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showAdvanced ? 'Hide' : 'Show'} MTD / YTD fields
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/30">
                {field('revenueMTD', 'Revenue MTD ($)')}
                {field('profitMTD', 'Profit MTD ($)')}
                {field('revenueYTD', 'Revenue YTD ($)')}
                {field('profitYTD', 'Profit YTD ($)')}
                {field('leadsMTD', 'Leads MTD')}
                {field('leadsYTD', 'Leads YTD')}
                {field('bookedCallsMTD', 'Calls MTD')}
                {field('bookedCallsYTD', 'Calls YTD')}
              </div>
            )}

            <Button
              onClick={() => logMut.mutate()}
              disabled={logMut.isPending || !activeOrgId}
              className="w-full h-12 rounded-xl text-base font-semibold shadow-lg hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              {logMut.isPending ? 'Saving...' : 'Save Metrics'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
