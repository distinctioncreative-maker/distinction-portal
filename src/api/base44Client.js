// PHASE 1 STUB — Base44 SDK removed.
// This file exports the identical interface shape so all 19 pages import
// without errors. All entity methods return empty data. Auth methods are
// no-ops. Phase 2 will replace these stubs with real fetch() calls.

const makeEntityStub = () => ({
  list: async () => [],
  filter: async () => [],
  create: async () => ({}),
  update: async () => ({}),
  delete: async () => ({}),
});

export const base44 = {
  entities: {
    Lead: makeEntityStub(),
    Task: makeEntityStub(),
    Appointment: makeEntityStub(),
    PipelineStage: makeEntityStub(),
    PipelineItem: makeEntityStub(),
    DailyMetric: makeEntityStub(),
    ActivityLog: makeEntityStub(),
    ClientNote: makeEntityStub(),
    Organization: makeEntityStub(),
    OrganizationSetting: makeEntityStub(),
    BillingPackage: makeEntityStub(),
    SupportSession: makeEntityStub(),
    SupportActionLog: makeEntityStub(),
    WidgetSetting: makeEntityStub(),
    Notification: makeEntityStub(),
    IntegrationStatus: makeEntityStub(),
  },
  auth: {
    me: async () => null,
    updateMe: async () => null,
    logout: () => {},
    redirectToLogin: () => {},
  },
  integrations: {
    Core: {
      InvokeLLM: async () => 'AI search not yet connected.',
    },
  },
};
