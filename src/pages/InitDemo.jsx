import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function InitDemo() {
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      try {
        // Fetch the first available org to assign the demo user to
        const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
        const orgId = orgs?.[0]?.id;
        if (!orgId) throw new Error('No organizations found');

        await supabase.auth.updateUser({
          data: { organizationId: orgId, role: 'owner', isActive: true },
        });

        navigate('/Dashboard', { replace: true });
      } catch (err) {
        console.error('Init failed:', err);
        navigate('/Dashboard', { replace: true });
      }
    }
    init();
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-accent rounded-full animate-spin"></div>
        <span className="text-xs text-muted-foreground tracking-wider uppercase">Initializing Demo</span>
      </div>
    </div>
  );
}
