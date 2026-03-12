import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

export default function InitDemo() {
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      try {
        await base44.auth.updateMe({
          organizationId: '69b2f6b90317a99f9510341c',
          role: 'owner',
          isActive: true
        });
        window.location.href = '/Dashboard';
      } catch (err) {
        console.error('Init failed:', err);
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