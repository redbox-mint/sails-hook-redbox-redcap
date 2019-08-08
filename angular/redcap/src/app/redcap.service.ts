import {Injectable, Inject} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/delay';
import {Observable} from 'rxjs/Observable';

import {BaseService} from './shared/base-service';
import {ConfigService} from './shared/config-service';

@Injectable()
export class RedcapService extends BaseService {

  protected baseUrl: any;
  public recordURL: string = this.brandingAndPortalUrl + '/record/view';
  protected initSubject: any;

  constructor(@Inject(Http) http: Http,
              @Inject(ConfigService) protected configService: ConfigService) {
    super(http, configService);
    this.initSubject = new Subject();
    this.emitInit();
  }

  public waitForInit(handler: any) {
    const subs = this.initSubject.subscribe(handler);
    this.emitInit();
    return subs;
  }

  public emitInit() {
    if (this.brandingAndPortalUrl) {
      this.initSubject.next('');
    }
  }

  public async project(token: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/redcap/project';
    try {
      const result = await this.http.post(
        wsUrl,
        {token: token},
        this.options
      ).toPromise();
      return Promise.resolve(this.extractData(result));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }

  public async link(workspace: any, rdmpId: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/redcap/link';
    try {
      const result = await this.http.post(
        wsUrl,
        {rdmp: rdmpId, workspace: workspace},
        this.options
      ).toPromise();
      return Promise.resolve(this.extractData(result));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }



}
