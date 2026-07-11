import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { RedcapFormComponent } from './redcap-form.component';
@NgModule({ declarations: [RedcapFormComponent], imports: [BrowserModule, FormsModule], providers: [provideHttpClient()], bootstrap: [RedcapFormComponent] })
export class RedcapModule {}
