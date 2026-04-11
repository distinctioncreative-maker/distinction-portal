import React, { useState, useEffect } from 'react';
import { widgetSettingsApi } from '@/api/widgetSettings';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ToggleLeft, GripVertical } from 'lucide-react';

const defaultWidgets = [
  { key: 'revenue_daily', label: 'Daily Revenue', description: 'Revenue metrics for today' },
  { key: 'revenue_chart', label: 'Revenue Chart', description: 'Revenue and profit trend chart' },
  { key: 'pipeline_summary', label: 'Pipeline Summary', description: 'Pipeline stages overview' },
  { key: 'tasks_due', label: 'Tasks Due', description: 'Upcoming and overdue tasks' },
  { key: 'recent_activity', label: 'Recent Activity', description: 'Timeline of recent actions' },
  { key: 'quick_actions', label: 'Quick Actions', description: 'Shortcut buttons for common actions' },
  { key: 'leads_today', label: 'Leads Today', description: 'New leads count for today' },
  { key: 'booked_calls', label: 'Booked Calls', description: 'Upcoming appointments' },
];

export default function WidgetPreferences() {
  const { activeOrgId } = useOrg();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: widgetSettings } = useQuery({
    queryKey: ['widgetSettings', activeOrgId, user?.id],
    queryFn: () => activeOrgId && user?.id ? widgetSettingsApi.list(activeOrgId, user.id) : [],
    initialData: [],
  });

  const toggleMut = useMutation({
    mutationFn: async ({ widgetKey, isVisible }) => {
      return widgetSettingsApi.upsert(activeOrgId, user?.id, widgetKey, isVisible);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['widgetSettings'] }),
  });

  const getVisibility = (key) => {
    const setting = widgetSettings.find(w => w.widgetKey === key);
    return setting ? setting.isVisible : true;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Widget Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">Customize your dashboard layout</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><ToggleLeft className="w-4 h-4" /> Dashboard Widgets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {defaultWidgets.map(widget => (
            <div key={widget.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground/40" />
                <div>
                  <p className="text-sm font-medium">{widget.label}</p>
                  <p className="text-xs text-muted-foreground">{widget.description}</p>
                </div>
              </div>
              <Switch
                checked={getVisibility(widget.key)}
                onCheckedChange={(val) => toggleMut.mutate({ widgetKey: widget.key, isVisible: val })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-2">Drag & Drop Reordering</h3>
        <p className="text-xs text-muted-foreground">Custom widget ordering and sizing coming soon.</p>
      </Card>
    </div>
  );
}