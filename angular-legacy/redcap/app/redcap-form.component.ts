import {Component, Inject, Input, ElementRef, Output, EventEmitter} from '@angular/core';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {FormGroup, FormControl, Validators, NgForm} from '@angular/forms';
import {RecordsService} from '../../shared/form/records.service';
import {LoadableComponent} from '../..//shared/loadable.component';
import {FieldControlService} from '../../shared/form/field-control.service';
import {Observable} from 'rxjs/Observable';
import * as _ from "lodash";
import {TranslationService} from '../../shared/translation-service';

import {RedcapTokenComponent, RedcapTokenField} from './components/redcap-token.component';

import * as jQuery from 'jquery';


/**
 * Main LabArchives Edit component
 *
 * @author <a target='_' href='https://github.com/moisbo'>moisbo</a>
 *
 */
@Component({
  moduleId: module.id,
  selector: 'redcap-form',
  templateUrl: './redcap-form.component.html',
  styleUrls: ['./redcap-form.component.css'],
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class RedcapFormComponent extends LoadableComponent {
  /**
   * The OID for this Form.
   *
   */
  @Input() oid: string;
  /**
   * Edit mode
   *
   */
  @Input() editMode: boolean;
  /**
   * The Record type
   *
   */
  @Input() recordType: string;
  /**
   * Fields for the form
   */
  fields: any[] = [];
  /**
   * Form group
   */
  form: FormGroup;
  /**
   * Initialization subscription
   */
  initSubs: any;
  /**
   * Field map
   */
  fieldMap: any;
  /**
   * Form JSON string
   */
  payLoad: any;
  /**
   * Form status
   */
  status: any;
  /**
   * Critical error message
   */
  criticalError: any;
  /**
   * Form definition
   */
  formDef: any;
  /**
   * CSS classes for this form
   */
  cssClasses: any;
  /**
   * Flag when form needs saving.
   *
   */
  needsSave: boolean;
  /**
   * Links to tabs
   */
  failedValidationLinks: any[];
  /**
   * Expects a number of DI'ed elements.
   */

  login: any;
  loading: boolean = false;
  loggedIn: any;
  rdmp: string;
  user: any;

  constructor(
    elm: ElementRef,
    @Inject(RecordsService) protected RecordsService: RecordsService,
    @Inject(FieldControlService) protected fcs: FieldControlService,
    @Inject(Location) protected LocationService: Location,
    public translationService: TranslationService
  ) {
    super();
    this.oid = elm.nativeElement.getAttribute('oid');
    this.editMode = elm.nativeElement.getAttribute('editMode') == "true";
    this.recordType = elm.nativeElement.getAttribute('recordType');
    this.rdmp = elm.nativeElement.getAttribute('rdmp');

    //TODO: Find out what is this next line!
    this.fieldMap = {_rootComp: this};
    this.user = {};

    this.initSubs = RecordsService.waitForInit((initStat: boolean) => {
      this.initSubs.unsubscribe();
      this.loadForm();
    });

  }

  loginUser(user) {
    this.user = user;
  }

  registerEvents() {
    //this.fieldMap['ListWorkspaces'].field['setWorkspaceUser'].subscribe(this.setWorkspaceUser.bind(this));
  }

  loadForm() {
    this.fcs.addComponentClasses({
      'RedcapTokenField': {'meta': RedcapTokenField, 'comp': RedcapTokenComponent}
    });

    this.RecordsService.getForm(this.oid, this.recordType, this.editMode).then((obs: any) => {
      obs.subscribe((form: any) => {
        this.formDef = form;
        if (this.editMode) {
          this.cssClasses = this.formDef.editCssClasses;
        } else {
          this.cssClasses = this.formDef.viewCssClasses;
        }
        this.loggedIn = false;
        if (form.fieldsMeta) {
          this.fields = form.fieldsMeta;
          this.rebuildForm();
          this.watchForChanges();
          this.registerEvents();
          const focusTab = '?focusTabId=workspaces';
          this.fieldMap['BackToPlan'].field.value = this.fieldMap['BackToPlan'].field.value + this.rdmp + focusTab;
        }
      });
    }).catch((err: any) => {
      //console.log("Error loading form...");
      console.error(err)
      //console.log(err);
      if (err.status == false) {
        this.criticalError = err.message;
      }
      this.setLoading(false);
    });
  }

  /**
   * Rebuild the form message.
   *
   * @return {[type]}
   */
  rebuildForm() {
    this.form = this.fcs.toFormGroup(this.fields, this.fieldMap);
  }

  /**
   * Enable form change monitor.
   *
   * @return {[type]}
   */
  watchForChanges() {
    this.setLoading(false);
    if (this.editMode) {
      this.form.valueChanges.subscribe((data: any) => {
        //this.needsSave = true;
      });
    }
  }

  // setWorkspaceUser(workspaceUser: WorkspaceUser) {
  //   this.workspaceUser = workspaceUser;
  // }

}
