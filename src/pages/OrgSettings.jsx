import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, Building2, Palette, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function OrgSettings() {
  const { organization, activeOrgId, setOrganization } = useOrg();
  const qc = useQueryClient();
  const [orgForm, setOrgForm] = useState({ name: '', businessType: '', timezone: '', primaryColor: '' });

  const { data: settings } = useQuery({
    queryKey: ['orgSettings', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return null;
      const s = await base44.entities.OrganizationSetting.filter({ organizationId: activeOrgId });
      return s[0] || null;
    },
  });

  useEffect(() => {
    if (organization) {
      setOrgForm({
        name: organization.name || '',
        businessType: organization.businessType || '',
        timezone: organization.timezone || 'America/New_York',
        primaryColor: organization.primaryColor || '#D4A853',
      });
    }
  }, [organization]);

  const saveOrgMut = useMutation({
    mutationFn: () => base44.entities.Organization.update(organization.id, orgForm),
    onSuccess: (data) => { setOrganization({ ...organization, ...orgForm }); toast.success('Organization updated'); },
  });

  const toggleMut = useMutation({
    mutationFn: ({ key, value }) => {
      if (settings) return base44.entities.OrganizationSetting.update(settings.id, { [key]: value });
      return base44.entities.OrganizationSetting.create({ organizationId: activeOrgId, [key]: value });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orgSettings'] }),
  });

  const modules = [
    { key: 'pipelineEnabled', label: 'Pipeline & Deals', desc: 'Visual pipeline and deal tracking' },
    { key: 'calendarEnabled', label: 'Calendar & Appointments', desc: 'Schedule and manage appointments' },
    { key: 'crmEnabled', label: 'CRM & Lead Management', desc: 'Full lead lifecycle management' },
    { key: 'revenueTrackingEnabled', label: 'Revenue Tracking', desc: 'Daily revenue and profit metrics' },
    { key: 'chatbotEnabled', label: 'Chatbot', desc: 'AI-powered chatbot for your website' },
    { key: 'whatsappAssistantEnabled', label: 'WhatsApp Assistant', desc: 'Automated WhatsApp communication' },
    { key: 'aiInsightsEnabled', label: 'AI Insights', desc: 'AI-generated business insights' },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your business configuration</p>
      </div>

      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Building2 className="w-4 h-4" /> Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label className="text-xs">Business Name</Label><Input value={orgForm.name} onChange={e => setOrgForm({ ...orgForm, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Business Type</Label><Input value={orgForm.businessType} onChange={e => setOrgForm({ ...orgForm, businessType: e.target.value })} /></div>
            <div><Label className="text-xs">Timezone</Label><Input value={orgForm.timezone} onChange={e => setOrgForm({ ...orgForm, timezone: e.target.value })} /></div>
          </div>
          <Button onClick={() => saveOrgMut.mutate()} disabled={saveOrgMut.isPending} size="sm">
            <Save className="w-4 h-4 mr-1.5" /> Save
          </Button>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Palette className="w-4 h-4" /> Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Label className="text-xs">Primary Color</Label>
            <input type="color" value={orgForm.primaryColor} onChange={e => setOrgForm({ ...orgForm, primaryColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" />
            <span className="text-xs text-muted-foreground">{orgForm.primaryColor}</span>
          </div>
          <p className="text-xs text-muted-foreground">Logo upload and custom branding — coming soon.</p>
        </CardContent>
      </Card>

      {/* Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Zap className="w-4 h-4" /> Modules & Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {modules.map(mod => (
            <div key={mod.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{mod.label}</p>
                <p className="text-xs text-muted-foreground">{mod.desc}</p>
              </div>
              <Switch
                checked={settings?.[mod.key] ?? true}
                onCheckedChange={(val) => toggleMut.mutate({ key: mod.key, value: val })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Future Integrations Placeholder */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-2">Integrations</h3>
        <p className="text-xs text-muted-foreground">Connect third-party tools and services — coming soon.</p>
      </Card>
    </div>
  );
}