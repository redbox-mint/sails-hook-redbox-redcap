import { Component, ElementRef } from '@angular/core';
import { RedcapService, type RedcapProject } from './redcap.service';
@Component({ selector: 'redcap-form', standalone: false, templateUrl: './redcap-form.component.html', styleUrl: './redcap-form.component.scss' })
export class RedcapFormComponent {
  token = ''; project?: RedcapProject; linked = false; loading = false; linking = false; message = '';
  readonly rdmp: string; readonly baseUrl: string; readonly redcapUrl: string;
  constructor(element: ElementRef<HTMLElement>, private readonly service: RedcapService) {
    const node = element.nativeElement; this.rdmp = node.getAttribute('rdmp') ?? '';
    this.baseUrl = node.getAttribute('branding-and-portal-url') ?? location.pathname.split('/').slice(0, 3).join('/');
    this.redcapUrl = node.getAttribute('redcap-url') ?? '';
  }
  async validate(): Promise<void> {
    if (!this.token.trim() || this.loading) return; this.loading = true; this.message = '';
    try { const result = await this.service.project(this.baseUrl, this.token, this.rdmp); this.project = result.project; this.linked = result.linked === true; if (!result.status) this.message = result.message ?? 'Unable to validate this project.'; }
    catch (error) { this.message = this.errorMessage(error); } finally { this.loading = false; }
  }
  async link(): Promise<void> {
    if (!this.project || this.linked || this.linking) return; this.linking = true; this.message = 'Linking project…';
    try { const result = await this.service.link(this.baseUrl, this.project, this.rdmp, this.token); this.linked = result.status; this.message = result.status ? 'Success!' : result.message ?? 'Unable to link this project.'; }
    catch (error) { this.message = this.errorMessage(error); } finally { this.linking = false; }
  }
  private errorMessage(error: unknown): string { return error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Unable to complete the REDCap request.'; }
}
