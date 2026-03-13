import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Save, User, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ displayName: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ displayName: user.displayName || user.full_name || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ displayName: form.displayName, phone: form.phone });
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
    setSaving(false);
  };

  const initials = (user?.full_name || user?.email || '??').slice(0, 2).toUpperCase();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-lg font-semibold bg-accent text-accent-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user?.full_name || 'User'}</CardTitle>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Shield className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground capitalize">{user?.role || 'staff'}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-xs">Display Name</Label>
            <Input value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input value={user?.email || ''} disabled className="bg-muted" />
          </div>
          <div>
            <Label className="text-xs">Phone</Label>
            <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-1.5" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences Placeholder */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-2">Notification Preferences</h3>
        <p className="text-xs text-muted-foreground">Email and in-app notification preferences coming soon.</p>
      </Card>
    </div>
  );
}