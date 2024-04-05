import { Sails, Model } from 'sails';

import { from } from 'rxjs';
import axios from 'axios';

import { Config } from '../Config';
import { Services as services } from '@researchdatabox/redbox-core-types';

declare var sails: Sails;
declare var WorkspaceService, _;

export module Services {

  export class RedcapService extends services.Core.Service {

    protected config: Config;
    protected _exportedMethods: any = [
      'project',
      'addlinkinfo'
    ];
    axiosInstance: axios.AxiosInstance;

    constructor() {
      super();
      this.config = null;
      this.axiosInstance = axios.create({
        // baseURL: baseUrl,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': 'application/json'
        }
      });
    }

    async project(config: any, token: string) {
      
      let formData = new FormData();
      formData.append('token', token);
      formData.append('content', 'project');
      formData.append('format', 'json');
      formData.append('returnFormat', 'json');

      let response = await axios.post(config.http + config.host + config.path, formData);
      return response.data;
    }

    async addlinkinfo(config: any, token: string, new_notes: string) {
      let formData = new FormData();
      formData.append('token', token);
      formData.append('content', 'project_settings');
      formData.append('format', 'json');
      formData.append('data', new_notes);

      let response = await axios.post(config.http + config.host + config.path, formData);
      return response.data;
    }
  }
}

module.exports = new Services.RedcapService().exports();
