import {Output, EventEmitter, Component, OnInit, Inject, Injector} from '@angular/core';
import {FormGroup, FormControl, Validators, NgForm} from '@angular/forms';
import {SimpleComponent} from '../shared/form/field-simple.component';
import {FieldBase} from '../shared/form/field-base';

//declare var jQuery: any;
import {RedcapService} from "../redcap.service";

declare var jQuery: any;

export class RedcapTokenField extends FieldBase<any> {
  loading: boolean;
  valid = true;
  token: string;
  columns: object[];
  tokenLabel: string;
  tokenAddLabel: string;
  tokenError: string;
  helpTokenLabel: string;
  helpTokenLabelList: object[];
  helpTokenImage: string;
  helpTokenImageAlt: string;
  submitted = false;
  errorMessage: string = undefined;
  closeLabel: string;
  location: string;
  user: any;

  redcapService: RedcapService;
  tokenLoaded: boolean = false;
  project: any;

  linkLabel: string;
  processing: boolean;
  workspaceDetailsTitle: string;
  workspaceDefinition: string;
  currentWorkspace: any;
  processingLabel: string;
  processingMessage: string;
  processingSuccess: string;
  processingFail: string;
  processingStatus: string;
  processingNoPermission: string;
  rdmp: string;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.loading = true;
    this.columns = options['columns'] || [];
    this.tokenLabel = options['tokenLabel'] || 'Add token';
    this.tokenAddLabel = options['tokenAddLabel'] || 'Add token'
    this.tokenError = options['tokenError'] || 'Please include token';
    this.helpTokenLabel = options['helpTokenLabel'] || '';
    this.helpTokenLabelList = options['helpTokenLabelList'] || [];
    this.helpTokenImageAlt = options['helpTokenImageAlt'] || 'REDCap help token';
    this.helpTokenImage = options['helpTokenImage'] || this.helpTokenImageAlt;
    this.closeLabel = options['closeLabel'] || 'Close';
    this.redcapService = this.getFromInjector(RedcapService);
    this.linkLabel = options['linkLabel'] || 'Link to Plan';
    console.log(this.columns);
  }

  init() {
    this.rdmp = this.fieldMap._rootComp.rdmp;
  }

  async addToken(value){
    this.token = value;
    console.log(this.token);
    //TODO: wrap try/catch
    const res = await this.redcapService.project(this.token);
    if(res.status){
      this.project = res.project;
      this.tokenLoaded = true;
    } else {
        this.errorMessage = res.message;
        this.tokenLoaded = false;
    }
  }

  async linkProject(project: any) {
    try {
      //jQuery('#linkModal').modal('show');
      this.processing = true;
      this.processingStatus = 'linking';
      const link = await this.redcapService.link(project, this.rdmp);
      this.processingStatus = 'done';
      //this.checks.link = true;
      this.processing = false;
      if (link.status) {
        //this.checks.linkCreated = true;
        //this.checks.master = true;
        this.processingFail = undefined;
      } else if(link.message === 'cannot insert node'){
        this.processingFail = this.processingNoPermission;
        //this.checks.linkWithOther = true
      }
    } catch (e) {
      this.processing = false;
      //this.checks.linkWithOther = true;
    }
  }


}

@Component({
  selector: 'ws-redcaptoken',
  template: `
  <div *ngIf="!field.tokenLoaded">
    <form #form="ngForm">
      <div class="form-group">
        <label>{{ field.tokenLabel }}</label>
        <input type="text" class="form-control" name="token" ngModel
               attr.aria-label="{{ field.tokenLabel }}">
      </div>
      <div class="form-row">
        <p>
          <button (click)="field.addToken(form.value)" type="submit" [disabled]="!field.valid" class="btn btn-primary">
            {{ field.tokenAddLabel }}
          </button>
        </p>
      </div>
    </form>
    <div class="row">
      <p>&nbsp;</p>
    </div>
    <div class="form-row">
      <p>{{ field.helpTokenLabel }}</p>
      <ul>
        <li *ngFor="let help of field.helpTokenLabelList">{{ help }}</li>
      </ul>
      <div class="form-row col-md-6">
        <img alt="{{ field.helpTokenImageAlt }}" [src]="field.helpTokenImage"
             style="padding: 4px; border: dotted 1px #ccc;"/>
      </div>
    </div>
    </div>
    <div *ngIf="field.tokenLoaded">
      <table style="width:100%">
        <tr>
          <td>Project Title</td>
          <td>{{ field.project.project_title }}</td>
        </tr>
        <tr>
          <td>Creation Time</td>
          <td>{{ field.project.creation_time }}</td>
        </tr>
        <tr>
          <td>Production Time</td>
          <td>{{ field.project.production_time }}</td>
        </tr>
        <tr>
          <td>Language</td>
          <td>{{ field.project.project_language }}</td>
        </tr>
        <tr>
          <td>Notes</td>
          <td>{{ field.project.project_notes }}</td>
        </tr>
      </table>
      <div class="form-row">
        <p>
          <button (click)="field.linkProject(field.project)" type="submit" [disabled]="!field.valid" class="btn btn-primary">
            {{ field.linkLabel }}
          </button>
        </p>
      </div>
    </div>
  `
})
export class RedcapTokenComponent extends SimpleComponent {
  field: RedcapTokenField;
  ngOnInit() {
    this.field.init();
  }
}
