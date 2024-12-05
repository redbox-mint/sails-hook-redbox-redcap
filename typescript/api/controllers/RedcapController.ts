declare var module;
declare var sails, Model;
declare var _;

import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { RecordsService, Controllers as controllers } from '@researchdatabox/redbox-core-types';

declare var BrandingService, WorkspaceService, RedcapService, RecordsService: RecordsService, RecordTypesService, WorkflowStepsService;
/**
 * Package that contains all Controllers.
 */

import { Config } from '../Config';

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
    protected logHeader = "RedcapController::";

    constructor() {
      super();
      let that = this;
      sails.after(['ready'], function () {
        that.config = new Config(sails.config.workspaces);
      });

    }

    public async project(req, res) {
      try {
        var tokenReq = req.param('token');
        const token = tokenReq.token;
        sails.log.debug(token);
        sails.log.error('Config Object:' + JSON.stringify(this.config))
        let config:any = {
          url: this.config.location,
          path: this.config.path
        };
        if(this.config.http != null) {
          config = {
            http: this.config.http,
            host: this.config.host,
            path: this.config.path
          }
        }

        sails.log.verbose(`${this.logHeader} project() -> Config: ${JSON.stringify(config)}`);
        sails.log.verbose(`${this.logHeader} project() -> notesHeader: ${sails.config.redcap.notesHeader}`);
        const projectInfo = await RedcapService.project(config, token);
        let linked = false; 
        if (projectInfo && projectInfo.project_notes) {
          const projectNotes = projectInfo.project_notes;
          linked = projectNotes.indexOf(sails.config.redcap.notesHeader) !== -1;
        }
        this.ajaxOk(req, res, null, { status: true, linked: linked, project: projectInfo });
      } catch (error) {
        this.ajaxFail(req, res, error.message, { status: false, message: error.message });
      }
    }

    public async link(req, res) {
      const brand = BrandingService.getBrand(req.session.branding);
      const user = req.user;

      this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
      const rdmp = req.param('rdmp');
      const project = req.param('workspace');
      const token = req.param('token');
      sails.log.debug('Token to be linked is: ' + token);
      if (!project || !rdmp) {
        const message = 'rdmp, project are missing';
        this.ajaxFail(req, res, message, { status: false, message: message });
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
      let config:any = {
        url: this.config.location,
        path: this.config.path
      };
      if(this.config.http != null) {
        config = {
          http: this.config.http,
          host: this.config.host,
          path: this.config.path
        }
      }
      const notesHeader = sails.config.redcap.notesHeader;
      if (projectNotes.indexOf(notesHeader) == -1) {
        sails.log.debug('project id: ' + projectID);
        sails.log.debug('project description: ' + projectNotes);
        let newNotesObject = {
          project_notes: `${projectNotes} ${notesHeader}: ${rdmp}.`
        }

        newNotes = JSON.stringify(newNotesObject)
        sails.log.debug('New Project Notes: ' + newNotes);
        try {
          let recordMetadata = await RecordsService.getMeta(rdmp);
          if (_.isEmpty(recordMetadata)) {
            sails.log.error(`${this.logHeader} link() -> Failed to find RDMP: ${rdmp}`);
            throw new Error(`Failed to find RDMP: ${rdmp}, please contact an administrator`);
          }
          let redCapResponse = await RedcapService.addlinkinfo(config, token, newNotes)
          sails.log.verbose(`${this.logHeader} link() -> Redcap response:`);
          sails.log.verbose(redCapResponse);
          rdmpTitle = recordMetadata.title;
          const record = {
            rdmpOid: rdmp,
            rdmpTitle: rdmpTitle,
            redcap_id: projectID,
            title: projectName,
            location: `${this.config.location}/${this.config.redcapVersion}/index.php?pid=${projectID}`,
            description: this.config.description, //'RedCap Workspace',
            type: this.config.recordType
          };
          //sails.log.debug(record);
          let workspace = await this.createRecordByType(brand, this.config.recordType, record, user);

          if (workspace.isSuccessful()) {
            const appendWsResp = await WorkspaceService.addWorkspaceToRecord(rdmp, workspace.oid);
            if (!appendWsResp.isSuccessful()) {
              sails.log.error(`${this.logHeader} link() -> Appending workspace to record failed:`);
              sails.log.error(appendWsResp);
              throw new Error(`Failed to append workspace to RDMP record`);
            }
          } else {
            sails.log.error(`${this.logHeader} link() -> Failed to create workspace record:`);
            sails.log.error(workspace);
            throw new Error(`Failed to add workspace record`);
          }
          this.ajaxOk(req, res, null, { status: true, message: 'workspaceRecordCreated' });

        } catch (error) {
          sails.log.error(`${this.logHeader} link() -> Failed to link project:`);
          sails.log.error(error);
          this.ajaxFail(req, res, error.message, { status: false, message: `Failed to link project with RDMP, please contact an administrator.` });
        }
      } else {
        this.ajaxFail(req, res, null, { status: false, message: `Project has already been linked to an RDMP, see '${notesHeader}' value in the 'Notes' section.`, linked: true });
      }
    
  }

    async createRecordByType(brand: any, recordType: string, recordMetadata: any, user: any, targetStep: string = null) {
      let record: any = {
        metaMetadata: {}
      };

      record.authorization = {
        view: [user.username],
        edit: [user.username]
      };
      record.metaMetadata.brandId = brand.id;
      record.metaMetadata.createdBy = user.username;
      record.metaMetadata.type = recordType;
      record.metadata = recordMetadata;

      let recType = await RecordTypesService.get(brand, recordType).toPromise();

      if (recType.packageType) {
        record.metaMetadata.packageType = recType.packageType;
      }

      if (recType.packageName) {
        record.metaMetadata.packageName = recType.packageName;
      }
      let wfStep = await WorkflowStepsService.getFirst(recType).toPromise();
      if (targetStep) {
        wfStep = await WorkflowStepsService.get(recType, targetStep).toPromise();
      }

      this.setWorkflowStepRelatedMetadata(record, wfStep);
      return await RecordsService.create(brand, record, recType, user);
    }

    protected setWorkflowStepRelatedMetadata(currentRec: any, nextStep: any) {
      if (!_.isEmpty(nextStep)) {
        sails.log.verbose('setWorkflowStepRelatedMetadata - enter');
        sails.log.verbose(nextStep);

        currentRec.previousWorkflow = currentRec.workflow;
        currentRec.workflow = nextStep.config.workflow;
        // TODO: validate data with form fields
        currentRec.metaMetadata.form = nextStep.config.form;
        // Check for JSON-LD config
        if (sails.config.jsonld.addJsonLdContext) {
          currentRec.metadata['@context'] = sails.config.jsonld.contexts[currentRec.metaMetadata.form];
        }
        //TODO: if this was all typed we probably don't need these sorts of initialisations
        if(currentRec.authorization == undefined) {
          currentRec.authorization = {
            viewRoles:[],
            editRoles:[],
            edit:[],
            view:[]
          };
        }
        
        // update authorizations based on workflow...
        currentRec.authorization.viewRoles = nextStep.config.authorization.viewRoles;
        currentRec.authorization.editRoles = nextStep.config.authorization.editRoles;
      }
    } 
  }
}
module.exports = new Controllers.RedcapController().exports();
