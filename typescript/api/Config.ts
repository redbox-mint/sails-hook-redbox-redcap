export class Config {
  host: string;
  recordType: string;
  formName: string;
  workflowStage: string;
  appName: string;
  parentRecord: string;
  provisionerUser: string;
  brandingAndPortalUrl: string;
  redboxHeaders: any;
  domain: string;
  defaultGroupId: number;
  types: any;
  workspaceFileName: string;
  key: any;
  location: string;
  description: string;

  constructor(workspaces) {
    const workspaceConfig = workspaces;
    const rc = workspaceConfig.redcap;

    this.host = rc.host;
    this.recordType = rc.recordType;
    this.workflowStage = rc.workflowStage;
    this.formName = rc.formName;
    this.appName = rc.appName;
    this.domain = rc.domain;
    this.parentRecord = workspaceConfig.parentRecord;
    this.provisionerUser = workspaceConfig.provisionerUser;

    this.location = rc.location;
    this.description = rc.description;

    this.brandingAndPortalUrl = '';
    this.redboxHeaders = {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      'Authorization': workspaceConfig.portal.authorization,
    };
    this.defaultGroupId = rc.defaultGroupId;

    this.types = rc.types;
    this.workspaceFileName = rc.workspaceFileName;
    this.key = rc.key;

  }
}
