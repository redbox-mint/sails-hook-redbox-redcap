declare var module;
declare var sails, Model;
declare var _;

import {Observable} from 'rxjs';

declare var BrandingService, WorkspaceService, RedcapService;
/**
 * Package that contains all Controllers.
 */
import controller = require('../core/CoreController');
import {Config} from '../Config';

export module Controllers {

  /**
   * Redcap related features....
   *
   */
  export class RedcapController extends controller.Controllers.Core.Controller {

    protected _exportedMethods: any = [
      'project',
      'link'
    ];

    _config: any;
    protected config: Config;
    //config: any;

    constructor() {
      super();
      this.config = null;
      //this.config = new Config(sails.config.workspaces);
    }

    public async project(req, res) {
      try{
        var tokenReq = req.param('token');
        sails.log.debug(tokenReq.token);
        const config = {
          http: 'https://',
          host: 'redcap.research.uts.edu.au',
          path: '/api/'
        };
        const projectInfo = await RedcapService.project(config, tokenReq.token);
        //this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
        this.ajaxOk(req, res, null, {status: true, project: projectInfo});
      } catch (error) {
        this.ajaxFail(req, res, error.message, {status: false, message: error.message});
      }
    }

    public async link(req, res){
      try{
        const rdmp = req.param('rdmp');
        const project = req.param('workspace');
        sails.log.debug('RDMP id: ' + rdmp['id']);
        if (!project || !rdmp) {
          const message = 'rdmp, project are missing';
          this.ajaxFail(req, res, message, {status: false, message: message});
          return;
        }
        const projectName = project.project_name;
        const projectNotes = project.project_notes;
        sails.log.debug('project name: ' + projectName);
        sails.log.debug('project notes: ' + projectNotes);
        this.ajaxOk(req, res, null, {status: true, message: 'workspaceRecordCreated'});
      } catch(error){
        this.ajaxFail(req, res, error.message, {status: false, message: error.message});
      }
    }
  }
}
module.exports = new Controllers.RedcapController().exports();
