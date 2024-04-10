declare var _;

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
  path: string;
  redcapVersion: string;
  http: string;

  constructor(workspaces) {
    const workspaceConfig = workspaces;
    const rc = workspaceConfig.redcap;

    this.http = _.get(rc,'http');
    this.host = _.get(rc,'host');
    this.recordType = _.get(rc,'recordType');
    this.workflowStage =  _.get(rc,'workflowStage');
    this.formName =  _.get(rc,'formName');
    this.appName =  _.get(rc,'appName');
    this.domain =  _.get(rc,'domain');
    this.path =  _.get(rc,'apiPath', '/api/');
    this.redcapVersion =  _.get(rc,'redcapVersion', 'redcap_v14.0.15');
    this.parentRecord = workspaceConfig.parentRecord;
    this.provisionerUser = workspaceConfig.provisionerUser;

    this.location = _.get(rc,'location')
    this.description = _.get(rc,'description')

    this.brandingAndPortalUrl = '';
    this.redboxHeaders = {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      'Authorization': workspaceConfig.portal.authorization,
    };
    this.defaultGroupId = _.get(rc,'defaultGroupId');

    this.types = _.get(rc,'types');
    this.workspaceFileName = _.get(rc,'workspaceFileName');
    this.key = _.get(rc,'key');

  }
}
