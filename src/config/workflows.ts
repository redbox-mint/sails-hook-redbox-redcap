import type { WorkflowConfig } from '@researchdatabox/redbox-core';
export const workflows: WorkflowConfig = { redcap: { draft: { config: {
  workflow: { stage: 'draft', stageLabel: 'Draft' }, authorization: { viewRoles: ['Admin', 'Librarians'], editRoles: ['Admin', 'Librarians'] },
  form: 'redcap-1.0-draft', displayIndex: 0
}, starting: true } } };
