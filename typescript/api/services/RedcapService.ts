import { Sails, Model } from 'sails';
import * as requestPromise from "request-promise";
import { from } from 'rxjs';

import { Config } from '../Config';

import services = require('../core/CoreService');

declare var sails: Sails;
declare var WorkspaceService, _;

export module Services {

  export class RedcapService extends services.Services.Core.Service {

    protected config: Config;
    protected _exportedMethods: any = [
      'project',
      'addlinkinfo'
    ];

    constructor() {
      super();
      this.config = null;
    }

    project(config: any, token: string) {
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
          returnFormat : 'json'
        },
        json: true
      };
      return requestPromise(opts);
    }

    addlinkinfo(config: any, token: string, new_notes: string) {
      const opts = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': 'application/json'
        },
        uri: config.http + config.host + config.path,
        method: 'POST',
        formData: {
          token: token,
          content: 'project_settings',
          format: 'json',
          data: new_notes
        },
        json: true
      };
      return from(requestPromise(opts));
    }
  }
}

module.exports = new Services.RedcapService().exports();
