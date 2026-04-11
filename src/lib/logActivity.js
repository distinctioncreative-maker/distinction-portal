import { supabase } from '@/lib/supabaseClient';

// Fire-and-forget activity logger. Call from mutation onSuccess callbacks.
// Never throws — failures are logged to console only and never block the UI.
export function logActivity({ orgId, entityType, entityId, action, description, userId, userEmail }) {
  supabase
    .from('activity_logs')
    .insert({
      organization_id: orgId,
      entity_type: entityType,
      entity_id: entityId || null,
      action,
      description,
      user_id: userId || null,
      user_email: userEmail || null,
    })
    .then(({ error }) => {
      if (error) console.warn('logActivity failed:', error.message);
    });
}
