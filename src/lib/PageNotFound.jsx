import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Home } from 'lucide-react';

export default function PageNotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const pageName = location.pathname.substring(1);
  const isAdmin = ['admin', 'superadmin'].includes(user?.role);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-7xl font-light text-muted-foreground/30">404</h1>
          <div className="h-0.5 w-16 bg-border mx-auto" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-medium">Page Not Found</h2>
          <p className="text-muted-foreground leading-relaxed">
            The page <span className="font-medium text-foreground">"{pageName}"</span> could not be found.
          </p>
        </div>

        {isAdmin && (
          <div className="p-4 bg-muted/40 rounded-xl border border-border/50 text-left">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Admin Note</p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  This page hasn't been built yet. Add it to your development queue.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border/60 hover:bg-muted/50 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
