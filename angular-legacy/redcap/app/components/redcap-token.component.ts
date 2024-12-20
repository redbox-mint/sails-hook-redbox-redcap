import {Output, EventEmitter, Component, OnInit, Inject, Injector} from '@angular/core';
import {FormGroup, FormControl, Validators, NgForm} from '@angular/forms';
import {SimpleComponent} from '../../../shared/form/field-simple.component';
import {FieldBase} from '../../../shared/form/field-base';

//declare var jQuery: any;
import {RedcapService} from "../redcap.service";

declare var jQuery: any;

export class RedcapTokenField extends FieldBase<any> {
  loading: boolean;
  valid = true;
  token: any;
  invalidToken: string;
  columns: object[];
  tokenLabel: string;
  tokenAddLabel: string;
  tokenError: boolean;
  helpTokenLabel: string;
  helpTokenLabelList: object[];
  helpTokenImage1: string;
  helpTokenImage2: string;
  helpTokenImage3: string;
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
  newlink: boolean;
  processingStatus: string;
  processingNoPermission: string;
  rdmp: string;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.loading = true;
    this.newlink = true;
    this.location = options['location'];
    this.columns = options['columns'] || [];
    this.tokenLabel = options['tokenLabel'] || 'Add token';
    this.tokenAddLabel = options['tokenAddLabel'] || 'Add token';
    this.tokenError = true;
    this.helpTokenLabel = options['helpTokenLabel'] || '';
    this.helpTokenLabelList = options['helpTokenLabelList'] || [];
    this.helpTokenImageAlt = options['helpTokenImageAlt'] || 'REDCap help token';
    this.helpTokenImage1 = options['helpTokenImage1'] || this.helpTokenImageAlt;
    this.helpTokenImage2 = options['helpTokenImage2'] || this.helpTokenImageAlt;
    this.helpTokenImage3 = options['helpTokenImage3'] || this.helpTokenImageAlt;
    this.closeLabel = options['closeLabel'] || 'Close';
    this.redcapService = this.getFromInjector(RedcapService);
    this.linkLabel = options['linkLabel'] || 'Link to Plan';
    //console.log(this.columns);
  }

  init() {
    this.rdmp = this.fieldMap._rootComp.rdmp;
  }

  async addToken(value){
    this.token = value;
    //console.log(this.token);
    try{
      const res = await this.redcapService.project(this.token);
      if(res.status){
        this.project = res.project;
        this.tokenLoaded = true;
        this.tokenError = false;
        // check if the project is already linked
        if (res.linked === true) {
          this.newlink = false;
          this.linkLabel = "Already linked";
        }
      } else {
        this.errorMessage = res.message;
        this.tokenLoaded = false;
        this.tokenError = true;
        this.invalidToken = 'Invalid REDCap project token. Please check on REDCap.';
      }
    } catch (e) {
      this.tokenError = true;
    }
  }

  async linkProject(project: any) {
    try {
      this.processing = true;
      this.newlink = false;
      this.processingStatus = 'Linking';
      const link = await this.redcapService.link(project, this.rdmp, this.token.token);
      this.processing = false;
      if (link.status === true) {
        this.processingStatus = 'Success!';
      } else {
        if (link.message) {
          this.processingStatus = link.message;
        } else {
          this.processingStatus = 'Failed to link, please contact an administrator.';
        }
      }
    } catch (e) {
      this.processing = false;
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
        <div *ngIf="field.tokenError">
          <table style="width:100%">
            <tr>
              <td><b><font color = "red">{{ field.invalidToken }}</font></b></td>
            </tr>
          </table>
        </div>
      </form>
      <div class="row">
        <p>&nbsp;</p>
      </div>
      <div class="form-row">
        <p><b><font color="red">{{ field.helpTokenLabel }}</font></b></p>
        <div class="row">
          <div class="col-sm-4">
            <p><b>Step 1: Log in to REDCap: <a href="https://redcap.research.uts.edu.au">https://redcap.research.uts.edu.au</a></b></p>
            <p><b>Step 2: Create a new project if you do not have one yet.</b></p>
          </div>
          <div class="col-sm-8">
            <img alt="{{ field.helpTokenImageAlt }}" [src]="field.helpTokenImage1"
               style="padding: 4px; border: dotted 1px #ccc;"/>
            <p></p>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-4">
            <p><b>Step 3: Make sure you have the permissions to use a REDCap API for this project. If you do not have API permissions yet, please set this up by clicking on your email address in "User Rights", ticking the "Import" and "Export" API permissions and then refreshing the page.</b></p>
          </div>
          <div class="col-sm-8">
            <img alt="{{ field.helpTokenImageAlt }}" [src]="field.helpTokenImage2"
               style="padding: 4px; border: dotted 1px #ccc;"/>
            <p></p>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-4">
            <p><b>Step 4: From the "Applications" Menu on the left-hand side, click on "API".</b></p>
            <p><b>Step 5: Click on "Generate API token" button for this project.</b></p>
            <p><b>Step 6: Copy the API token, come back to this page on Stash, and paste the API token into the "REDCap Project API Token" field above.</b></p>
          </div>
          <div class="col-sm-8">
            <img alt="{{ field.helpTokenImageAlt }}" [src]="field.helpTokenImage3"
               style="padding: 4px; border: dotted 1px #ccc;"/>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="field.tokenLoaded">
      <table style="width:100%">
        <tr>
          <td>REDCap Project ID</td>
          <td>{{ field.project.project_id }}</td>
        </tr>
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
          <button (click)="field.linkProject(field.project)" type="submit" [disabled]="field.newlink === false" class="btn btn-primary">
            {{ field.linkLabel }}
          </button>
        </p>
      </div>
      <div *ngIf="field.newlink">
        <table style="width:100%">
          <tr>
            <td>{{ field.processingStatus }}</td>
          </tr>
        </table>
      </div>
      <div *ngIf="!field.newlink">
        <table style="width:100%">
          <tr>
            <td><b><font color = "red">{{ field.processingStatus }}</font></b></td>
          </tr>
        </table>
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
