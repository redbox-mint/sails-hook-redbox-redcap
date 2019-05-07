import { Sails, Model } from 'sails';
import * as requestPromise from "request-promise";

import { Config } from '../Config';

import services = require('../core/CoreService');

declare var sails: Sails;
declare var WorkspaceService, _;

export module Services {

  export class RedcapService extends services.Services.Core.Service {

    protected config: Config;
    protected _exportedMethods: any = [
      'project'
    ];

    constructor() {
      super();
      this.config = null;
      //this.config = new Config(sails.config.workspaces);
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
  }
}

module.exports = new Services.RedcapService().exports();
