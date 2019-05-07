"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestPromise = require("request-promise");
const services = require("../core/CoreService");
var Services;
(function (Services) {
    class RedcapService extends services.Services.Core.Service {
        constructor() {
            super();
            this._exportedMethods = [
                'project'
            ];
            this.config = null;
        }
        project(config, token) {
            const opts = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Accept': 'application/json'
                },
                uri: config.http + config.host + config.path,
                method: 'POST',
                formData: {
                    token: token,
                    content: 'project',
                    format: 'json',
                    returnFormat: 'json'
                },
                json: true
            };
            return requestPromise(opts);
        }
    }
    Services.RedcapService = RedcapService;
})(Services = exports.Services || (exports.Services = {}));
module.exports = new Services.RedcapService().exports();
