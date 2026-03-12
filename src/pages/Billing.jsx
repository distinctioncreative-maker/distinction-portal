import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, DollarSign, Package, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function Billing() {
  const { activeOrgId, userRole } = useOrg();
  const qc = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({});

  const isInternal = ['support', 'superadmin'].includes(userRole);

  const { data: billingPackage } = useQuery({
    queryKey: ['billing', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return null;
      const pkg = await base44.entities.BillingPackage.filter({ organizationId: activeOrgId });
      return pkg[0] || null;
    },
  });

  const saveMut = useMutation({
    mutationFn: (data) => {
      if (billingPackage) return base44.entities.BillingPackage.update(billingPackage.id, data);
      return base44.entities.BillingPackage.create({ ...data, organizationId: activeOrgId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing'] });
      setShowEdit(false);
    },
  });

  const handleEdit = () => {
    setForm({
      packageName: billingPackage?.packageName || '',
      billingType: billingPackage?.billingType || 'flat',
      setupFee: billingPackage?.setupFee || 0,
      monthlyRecurringFee: billingPackage?.monthlyRecurringFee || 0,
      billingNotes: billingPackage?.billingNotes || '',
    });
    setShowEdit(true);
  };

  if (!isInternal && !billingPackage) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">Billing & Plan</h1>
        <Card className="p-12 text-center border-dashed">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No billing package configured yet.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing & Plan</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage billing and subscription</p>
        </div>
        {isInternal && (
          <Button onClick={handleEdit} size="sm">
            <Shield className="w-4 h-4 mr-1.5" /> Edit Package
          </Button>
        )}
      </div>

      {/* Current Plan */}
      {billingPackage && (
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-5 h-5 text-accent" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-3xl font-bold">{billingPackage.packageName}</p>
              <Badge className="mt-2">{billingPackage.billingType}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Monthly Fee</p>
                <p className="text-2xl font-bold mt-1">${billingPackage.monthlyRecurringFee}</p>
              </div>
              {billingPackage.setupFee > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Setup Fee</p>
                  <p className="text-2xl font-bold mt-1">${billingPackage.setupFee}</p>
                </div>
              )}
            </div>
            {billingPackage.startDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Started {format(new Date(billingPackage.startDate), 'MMM d, yyyy')}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Method Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Stripe integration coming soon.</p>
        </CardContent>
      </Card>

      {/* Invoice History Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Invoice management coming soon.</p>
        </CardContent>
      </Card>

      {/* Edit Dialog (Internal Only) */}
      {isInternal && (
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Edit Billing Package</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Package Name</Label><Input value={form.packageName || ''} onChange={e => setForm({ ...form, packageName: e.target.value })} /></div>
              <div>
                <Label>Billing Type</Label>
                <Select value={form.billingType} onValueChange={v => setForm({ ...form, billingType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['flat', 'hybrid', 'custom', 'revenue_linked', 'manual'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Setup Fee</Label><Input type="number" value={form.setupFee || 0} onChange={e => setForm({ ...form, setupFee: parseFloat(e.target.value) })} /></div>
                <div><Label>Monthly Fee</Label><Input type="number" value={form.monthlyRecurringFee || 0} onChange={e => setForm({ ...form, monthlyRecurringFee: parseFloat(e.target.value) })} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.billingNotes || ''} onChange={e => setForm({ ...form, billingNotes: e.target.value })} rows={3} /></div>
              <Button onClick={() => saveMut.mutate(form)} disabled={!form.packageName || saveMut.isPending} className="w-full">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}