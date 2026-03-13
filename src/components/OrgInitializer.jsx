import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export default function OrgInitializer() {
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function initializeOrg() {
      if (!user || initialized) return;
      
      // Check if user already has organizationId
      if (user.organizationId) {
        setInitialized(true);
        return;
      }

      try {
        // Find first available organization
        const orgs = await base44.entities.Organization.list(null, 1);
        if (orgs.length > 0) {
          // Update user with organizationId
          await base44.auth.updateMe({ organizationId: orgs[0].id });
          console.log('User organizationId initialized:', orgs[0].id);
          // Reload page to refresh auth context
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to initialize organization:', error);
      }
      
      setInitialized(true);
    }

    initializeOrg();
  }, [user, initialized]);

  return null;
}