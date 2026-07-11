import type { FormConfigFrame } from '@researchdatabox/sails-ng-common';
import redcapDraft from './redcap-1.0-draft';

export const FormConfigExports: Record<string, FormConfigFrame> = {
  'redcap-1.0-draft': redcapDraft
};
