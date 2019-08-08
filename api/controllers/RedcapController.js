"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("rxjs/add/operator/map");
const controller = require("../core/CoreController");
const Config_1 = require("../Config");
var Controllers;
(function (Controllers) {
    class RedcapController extends controller.Controllers.Core.Controller {
        constructor() {
            super();
            this._exportedMethods = [
                'project',
                'link'
            ];
            this.config = new Config_1.Config(sails.config.workspaces);
        }
        project(req, res) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var tokenReq = req.param('token');
                    this.token = tokenReq.token;
                    sails.log.debug(this.token);
                    const config = {
                        http: 'https://',
                        host: 'redcap.research.uts.edu.au',
                        path: '/api/'
                    };
                    const projectInfo = yield RedcapService.project(config, tokenReq.token);
                    this.ajaxOk(req, res, null, { status: true, project: projectInfo });
                }
                catch (error) {
                    this.ajaxFail(req, res, error.message, { status: false, message: error.message });
                }
            });
        }
        link(req, res) {
            sails.log.debug('Token to be linked is: ' + this.token);
            const userId = req.user.id;
            const username = req.user.username;
            this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
            const rdmp = req.param('rdmp');
            const project = req.param('workspace');
            if (!project || !rdmp) {
                const message = 'rdmp, project are missing';
                this.ajaxFail(req, res, message, { status: false, message: message });
                return;
            }
            const projectID = project.project_id;
            const projectName = project.project_title;
            const projectNotes = project.project_notes;
            let newNotes = '';
            let workspace = null;
            let rdmpTitle = '';
            let recordMetadata = null;
            const config = {
                http: 'https://',
                host: 'redcap.research.uts.edu.au',
                path: '/api/'
            };
            if (projectNotes.indexOf('Stash RDMP ID') == -1) {
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
                    const record = {
                        rdmpOid: rdmp,
                        rdmpTitle: rdmpTitle,
                        id: projectID,
                        title: projectName,
                        location: this.config.location + "/redcap_v8.11.3/index.php?pid=" + projectID,
                        description: this.config.description,
                        type: this.config.recordType
                    };
                    return WorkspaceService.createWorkspaceRecord(this.config, username, record, this.config.recordType, this.config.workflowStage);
                })
                    .flatMap(response => {
                    workspace = response;
                    sails.log.debug('creating workspace record');
                    sails.log.debug('Workspace Oid: ' + workspace.oid);
                    if (recordMetadata.workspaces) {
                        const wss = recordMetadata.workspaces.find(id => workspace.oid === id);
                        if (!wss) {
                            recordMetadata.workspaces.push({ id: workspace.oid });
                        }
                    }
                    return WorkspaceService.updateRecordMeta(this.config, recordMetadata, rdmp);
                })
                    .subscribe(response => {
                    this.ajaxOk(req, res, null, { status: true, message: 'workspaceRecordCreated' });
                }, error => {
                    sails.log.error('link: error');
                    sails.log.error(error);
                    this.ajaxFail(req, res, error.message, { status: false, message: error.message });
                });
            }
            else {
                this.ajaxOk(req, res, null, { status: true, message: 'Project has already been linked', linked: true });
            }
        }
    }
    Controllers.RedcapController = RedcapController;
})(Controllers = exports.Controllers || (exports.Controllers = {}));
module.exports = new Controllers.RedcapController().exports();
