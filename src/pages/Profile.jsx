import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Save, User, Shield, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, updateCurrentUser } = useAuth();
  const [form, setForm] = useState({ displayName: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ newPassword: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ displayName: user.displayName || user.full_name || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCurrentUser({ full_name: form.displayName, phone: form.phone });
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSavingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.newPassword });
      if (error) throw error;
      setPwForm({ newPassword: '', confirm: '' });
      toast.success('Password updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
    }
    setSavingPw(false);
  };

  const initials = (user?.full_name || user?.email || '??').slice(0, 2).toUpperCase();
  const roleColor = {
    superadmin: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    support: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    admin: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    owner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  }[user?.role] || 'text-muted-foreground bg-muted border-border';

  return (
    <div className="min-h-screen">
      {/* Cinematic Header */}
      <div className="relative px-8 pt-12 pb-16 border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,185,80,0.07),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.05),transparent_50%)]" />
        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-accent/40 to-accent/10 rounded-2xl blur-md" />
              <Avatar className="relative w-20 h-20 rounded-2xl border-2 border-accent/30 shadow-2xl shadow-accent/20">
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-accent/20 to-accent/5 text-accent rounded-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                {user?.full_name || 'Your Profile'}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground/80">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold capitalize ${roleColor}`}>
                  <Shield className="w-3 h-3" />
                  {user?.role || 'user'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-3xl mx-auto space-y-6">
        {/* Profile Info */}
        <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
              <User className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-base font-bold">Account Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Display Name</Label>
              <Input
                value={form.displayName}
                onChange={e => setForm({ ...form, displayName: e.target.value })}
                className="h-11 rounded-xl"
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Email</Label>
              <Input value={user?.email || ''} disabled className="h-11 rounded-xl bg-muted/30 text-muted-foreground" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Phone</Label>
              <Input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="h-11 rounded-xl"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-11 rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>

        {/* Change Password */}
        <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Lock className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="text-base font-bold">Change Password</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">New Password</Label>
              <Input
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                className="h-11 rounded-xl"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Confirm Password</Label>
              <Input
                type="password"
                value={pwForm.confirm}
                onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                className="h-11 rounded-xl"
                placeholder="Repeat new password"
              />
            </div>
            <Button
              onClick={handlePasswordChange}
              disabled={savingPw || !pwForm.newPassword}
              variant="outline"
              className="h-11 rounded-xl font-semibold"
            >
              <Lock className="w-4 h-4 mr-2" />
              {savingPw ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
