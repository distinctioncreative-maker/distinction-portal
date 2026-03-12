import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { OrgProvider } from '@/components/OrgContext';

// Layout
import AppLayout from '@/components/layout/AppLayout';

// Pages
import Dashboard from '@/pages/Dashboard';
import Leads from '@/pages/Leads';
import Pipeline from '@/pages/Pipeline';
import Tasks from '@/pages/Tasks';
import CalendarPage from '@/pages/CalendarPage';
import Activity from '@/pages/Activity';
import Notifications from '@/pages/Notifications';
import Profile from '@/pages/Profile';
import OrgSettings from '@/pages/OrgSettings';
import SupportConsole from '@/pages/SupportConsole';
import SupportLogs from '@/pages/SupportLogs';
import OrgManagement from '@/pages/OrgManagement';
import WidgetPreferences from '@/pages/WidgetPreferences';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-accent rounded-full animate-spin"></div>
          <span className="text-xs text-muted-foreground tracking-wider uppercase">Loading</span>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <OrgProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/Dashboard" replace />} />
        <Route element={<AppLayout />}>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Leads" element={<Leads />} />
          <Route path="/Pipeline" element={<Pipeline />} />
          <Route path="/Tasks" element={<Tasks />} />
          <Route path="/Calendar" element={<CalendarPage />} />
          <Route path="/Activity" element={<Activity />} />
          <Route path="/Notifications" element={<Notifications />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/OrgSettings" element={<OrgSettings />} />
          <Route path="/SupportConsole" element={<SupportConsole />} />
          <Route path="/SupportLogs" element={<SupportLogs />} />
          <Route path="/OrgManagement" element={<OrgManagement />} />
          <Route path="/WidgetPreferences" element={<WidgetPreferences />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </OrgProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;