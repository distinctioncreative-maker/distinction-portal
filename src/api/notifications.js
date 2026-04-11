import { supabase } from '@/lib/supabaseClient';

function fromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    status: row.status,
    priority: row.priority,
    readAt: row.read_at,
    created_date: row.created_date,
  };
}

export const notificationsApi = {
  listForUser: async (userId, limit = 100) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(fromDb);
  },

  markRead: async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ status: 'read', read_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  markAllRead: async (userId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ status: 'read', read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('status', 'unread');
    if (error) throw error;
  },
};
