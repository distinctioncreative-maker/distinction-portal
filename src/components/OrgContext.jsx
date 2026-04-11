import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { supportSessionsApi } from '@/api/supportSessions';

const OrgContext = createContext(null);

export function OrgProvider({ children }) {
  const { user, updateCurrentUser } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [supportMode, setSupportMode] = useState(null); // { sessionId, orgId, orgName, reason }
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrg() {
      if (!user) { setIsLoading(false); return; }

      let orgId = user.organizationId;

      if (!orgId) {
        // Fallback: assign user to the first available org.
        const { data: orgs } = await supabase
          .from('organizations')
          .select('*')
          .limit(1);

        if (orgs?.length > 0) {
          orgId = orgs[0].id;
          setOrganization(orgs[0]);
          // Persist orgId onto the user so it survives refresh.
          updateCurrentUser({ organizationId: orgId }).catch(console.error);
        }
      } else {
        const { data: orgs } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .limit(1);

        if (orgs?.length > 0) setOrganization(orgs[0]);
      }

      setIsLoading(false);
    }

    loadOrg();
  }, [user?.id]);

  const activeOrgId = supportMode?.orgId || organization?.id;
  const isSupportMode = !!supportMode;
  const userRole = user?.role || 'user';
  const isInternal = userRole === 'superadmin' || userRole === 'support';

  const enterSupportMode = async (orgId, orgName, reason) => {
    const session = await supportSessionsApi.create({
      supportUserId: user.id,
      organizationId: orgId,
      reason,
      mode: 'read',
    });
    setSupportMode({ sessionId: session.id, orgId, orgName, reason });
    return session;
  };

  const exitSupportMode = async () => {
    if (supportMode?.sessionId) {
      supportSessionsApi.end(supportMode.sessionId).catch(console.warn);
    }
    setSupportMode(null);
  };

  return (
    <OrgContext.Provider value={{
      organization,
      activeOrgId,
      supportMode,
      isSupportMode,
      isInternal,
      userRole,
      isLoading,
      enterSupportMode,
      exitSupportMode,
      setOrganization,
    }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used within OrgProvider');
  return ctx;
}
