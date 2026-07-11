import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
export interface RedcapProject { project_id: string | number; project_title: string; project_notes?: string; [key: string]: unknown }
export interface RedcapResponse { status: boolean; linked?: boolean; project?: RedcapProject; message?: string }
@Injectable({ providedIn: 'root' })
export class RedcapService {
  constructor(private readonly http: HttpClient) {}
  project(baseUrl: string, token: string, rdmp: string): Promise<RedcapResponse> {
    return firstValueFrom(this.http.post<RedcapResponse>(`${baseUrl}/ws/redcap/project`, { token, rdmp })).catch(this.rethrow);
  }
  link(baseUrl: string, workspace: RedcapProject, rdmp: string, token: string): Promise<RedcapResponse> {
    return firstValueFrom(this.http.post<RedcapResponse>(`${baseUrl}/ws/redcap/link`, { workspace, rdmp, token })).catch(this.rethrow);
  }
  private rethrow(error: unknown): never {
    if (error instanceof HttpErrorResponse) throw error.error && typeof error.error === 'object' ? error.error : { message: error.message };
    throw error;
  }
}
