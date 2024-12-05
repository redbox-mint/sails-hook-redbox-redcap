import {BrowserModule} from '@angular/platform-browser';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';

import {RedcapService} from "./redcap.service";
import {RedcapFormComponent} from './redcap-form.component';
import {RedcapTokenComponent} from './components/redcap-token.component';

@NgModule({
  declarations: [
    RedcapFormComponent, RedcapTokenComponent
  ],
  imports: [
    BrowserModule, ReactiveFormsModule, FormsModule, SharedModule
  ],
  providers: [
    RedcapService
  ],
  bootstrap: [
    RedcapFormComponent
  ],
  entryComponents: [
    RedcapFormComponent, RedcapTokenComponent
  ]
})
export class RedcapModule { }
