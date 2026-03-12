import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const OrgContext = createContext(null);

export function OrgProvider({ children }) {
  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [supportMode, setSupportMode] = useState(null); // { sessionId, orgId, orgName, reason }
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrg() {
      if (!user) { setIsLoading(false); return; }
      
      const orgId = user.organizationId;
      if (orgId) {
        const orgs = await base44.entities.Organization.filter({ id: orgId });
        if (orgs.length > 0) setOrganization(orgs[0]);
      }
      setIsLoading(false);
    }
    loadOrg();
  }, [user]);

  const activeOrgId = supportMode?.orgId || organization?.id;
  const isSupportMode = !!supportMode;
  const userRole = user?.role || 'staff';
  const isInternal = userRole === 'superadmin' || userRole === 'support';

  const enterSupportMode = async (orgId, orgName, reason) => {
    const session = await base44.entities.SupportSession.create({
      organizationId: orgId,
      supportUserId: user?.id,
      enteredAt: new Date().toISOString(),
      accessReason: reason,
      mode: 'standard',
      status: 'active',
    });
    setSupportMode({ sessionId: session.id, orgId, orgName, reason });
    return session;
  };

  const exitSupportMode = async () => {
    if (supportMode?.sessionId) {
      await base44.entities.SupportSession.update(supportMode.sessionId, {
        exitedAt: new Date().toISOString(),
        status: 'ended',
      });
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