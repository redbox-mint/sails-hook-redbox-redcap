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
const controller = require("../core/CoreController");
var Controllers;
(function (Controllers) {
    class RedcapController extends controller.Controllers.Core.Controller {
        constructor() {
            super();
            this._exportedMethods = [
                'project',
                'link'
            ];
            this.config = null;
        }
        project(req, res) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var tokenReq = req.param('token');
                    sails.log.debug(tokenReq.token);
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
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const rdmp = req.param('rdmp');
                    const project = req.param('workspace');
                    sails.log.debug('RDMP id: ' + rdmp['id']);
                    if (!project || !rdmp) {
                        const message = 'rdmp, project are missing';
                        this.ajaxFail(req, res, message, { status: false, message: message });
                        return;
                    }
                    const projectName = project.project_name;
                    const projectNotes = project.project_notes;
                    sails.log.debug('project name: ' + projectName);
                    sails.log.debug('project notes: ' + projectNotes);
                    this.ajaxOk(req, res, null, { status: true, message: 'workspaceRecordCreated' });
                }
                catch (error) {
                    this.ajaxFail(req, res, error.message, { status: false, message: error.message });
                }
            });
        }
    }
    Controllers.RedcapController = RedcapController;
})(Controllers = exports.Controllers || (exports.Controllers = {}));
module.exports = new Controllers.RedcapController().exports();
