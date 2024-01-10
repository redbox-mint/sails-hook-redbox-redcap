declare var module;
declare var sails, Model;
declare var _;

import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import { Controllers as controllers} from '@researchdatabox/redbox-core-types';

declare var BrandingService, WorkspaceService, RedcapService;
/**
 * Package that contains all Controllers.
 */

import {Config} from '../Config';

export module Controllers {
  /**
   * Redcap related features....
   *
   */
  export class RedcapController extends controllers.Core.Controller {

    protected _exportedMethods: any = [
      'project',
      'link'
    ];


    protected config: Config;
    token: string;
    //config: any;

    constructor() {
      super();
      this.config = new Config(sails.config.workspaces);
    }

    public async project(req, res) {
      try{
        var tokenReq = req.param('token');
        this.token = tokenReq.token;
        sails.log.debug(this.token);
        const config = {
          http: 'https://',
          host: 'redcap.research.uts.edu.au',
          path: '/api/'
        };
        const projectInfo = await RedcapService.project(config, tokenReq.token);
        this.ajaxOk(req, res, null, {status: true, project: projectInfo});
      } catch (error) {
        this.ajaxFail(req, res, error.message, {status: false, message: error.message});
      }
    }

    public link(req, res){
      sails.log.debug('Token to be linked is: ' + this.token);
      const userId = req.user.id;
      const username = req.user.username;
      this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
      const rdmp = req.param('rdmp');
      const project = req.param('workspace');

      if (!project || !rdmp) {
        const message = 'rdmp, project are missing';
        this.ajaxFail(req, res, message, {status: false, message: message});
        return;
      }

      const projectID = project.project_id;
      const projectName = project.project_title;
      const projectNotes = project.project_notes;
      //const project_link = this.config.location;
      let newNotes = '';
      let workspace: any = null;
      let rdmpTitle = '';
      let recordMetadata = null;
      const config = {
        http: 'https://',
        host: 'redcap.research.uts.edu.au',
        path: '/api/'
      };
      //sails.log.debug(projectNotes.indexOf('Stash RDMP ID'));
      if(projectNotes.indexOf('Stash RDMP ID') == -1) {
        sails.log.debug('project id: ' + projectID);
        sails.log.debug('project description: ' + projectNotes);
        newNotes = '{"project_notes":"' + projectNotes + ' Stash RDMP ID: ' + rdmp + '."}';
        sails.log.debug('New Project Notes: ' + newNotes);
        RedcapService.addlinkinfo(config, this.token, newNotes)
          .flatMap(response => {
            sails.log.debug(response);
            return WorkspaceService.getRecordMeta(this.config, rdmp);
          })
          .flatMap(response => {
            recordMetadata = response;
            rdmpTitle = recordMetadata.title;
            //sails.log.debug(userId);
            //sails.log.debug('RDMP id: ' + rdmp);
            //sails.log.debug('RDMP title: ' + rdmpTitle);
            //sails.log.debug(response);

            const record = {
              rdmpOid: rdmp,
              rdmpTitle: rdmpTitle,
              id: projectID,
              title: projectName,
              location: this.config.location + "/redcap_v8.11.3/index.php?pid=" + projectID,
              description: this.config.description, //'RedCap Workspace',
              type: this.config.recordType
            };
            //sails.log.debug(record);
            return WorkspaceService.createWorkspaceRecord(
              this.config, username, record, this.config.recordType, this.config.workflowStage
            );
          })
          .flatMap(response => {
            workspace = response;
            sails.log.debug('creating workspace record');
            sails.log.debug('Workspace Oid: ' + workspace.oid);
            if (recordMetadata.workspaces) {
              const wss = recordMetadata.workspaces.find(id => workspace.oid === id);
              if (!wss) {
                recordMetadata.workspaces.push({id: workspace.oid});
              }
            }
            return WorkspaceService.updateRecordMeta(this.config, recordMetadata, rdmp);
          })
          .subscribe(response => {
            this.ajaxOk(req, res, null, {status: true, message: 'workspaceRecordCreated'});
          }, error => {
            sails.log.error('link: error');
            sails.log.error(error);
            this.ajaxFail(req, res, error.message, {status: false, message: error.message});
          });
      } else {
        this.ajaxOk(req, res, null, {status: true, message: 'Project has already been linked', linked: true});
      }
    }
  }
}
module.exports = new Controllers.RedcapController().exports();
