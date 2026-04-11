import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Zap } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/Dashboard', { replace: true });
    } catch (err) {
      setError(err.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,185,80,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,185,80,0.03),transparent_70%)]" />

      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

      <div className="relative w-full max-w-md px-6">
        {/* Brand mark */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/30 shadow-2xl shadow-accent/20 mb-6">
            <Zap className="w-7 h-7 text-accent" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
            Distinction OS
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/50" />
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70 font-semibold">
              Business Operating System
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/50" />
          </div>
        </div>

        {/* Card */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 via-accent/5 to-violet-500/10 rounded-3xl blur-xl opacity-60" />
          <div className="relative p-8 rounded-2xl border border-border/50 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-2xl shadow-2xl">

            <div className="mb-6">
              <h2 className="text-lg font-bold">Welcome back</h2>
              <p className="text-sm text-muted-foreground/80 mt-1">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Email Address
                </Label>
                <Input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-12 rounded-xl bg-background/50 border-border/60 focus-visible:ring-accent/40 focus-visible:border-accent/60 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Password
                </Label>
                <Input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="h-12 rounded-xl bg-background/50 border-border/60 focus-visible:ring-accent/40 focus-visible:border-accent/60 text-sm"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-accent/20 hover:shadow-2xl hover:shadow-accent/30 transition-all duration-300 mt-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in…</>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground/40 mt-8 tracking-wide">
          Secured by Supabase · Distinction Creative © 2026
        </p>
      </div>
    </div>
  );
}
