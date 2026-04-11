import { supabase } from '@/lib/supabaseClient';

function fromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    packageName: row.package_name,
    billingType: row.billing_type,
    setupFee: row.setup_fee,
    monthlyRecurringFee: row.monthly_recurring_fee,
    billingNotes: row.billing_notes,
    nextBillingDate: row.next_billing_date,
    status: row.status,
  };
}

function toDb(data) {
  const fieldMap = {
    organizationId: 'organization_id',
    packageName: 'package_name',
    billingType: 'billing_type',
    setupFee: 'setup_fee',
    monthlyRecurringFee: 'monthly_recurring_fee',
    billingNotes: 'billing_notes',
    nextBillingDate: 'next_billing_date',
  };
  const result = {};
  for (const [k, v] of Object.entries(data)) {
    result[fieldMap[k] ?? k] = v === '' ? null : v;
  }
  return result;
}

export const billingApi = {
  get: async (orgId) => {
    const { data, error } = await supabase
      .from('billing_packages')
      .select('*')
      .eq('organization_id', orgId)
      .maybeSingle();
    if (error) throw error;
    return fromDb(data);
  },

  upsert: async (orgId, data) => {
    const dbData = { ...toDb(data), organization_id: orgId };
    const { data: row, error } = await supabase
      .from('billing_packages')
      .upsert(dbData, { onConflict: 'organization_id' })
      .select()
      .single();
    if (error) throw error;
    return fromDb(row);
  },
};
