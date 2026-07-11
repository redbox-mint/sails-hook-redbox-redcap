import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RedcapService } from './redcap.service';
describe('RedcapService', () => { let service: RedcapService; let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ imports: [HttpClientTestingModule] }); service = TestBed.inject(RedcapService); http = TestBed.inject(HttpTestingController); });
  it('sends RDMP during validation', async () => { const promise = service.project('/brand/portal', 'secret', 'rdmp-1'); const req = http.expectOne('/brand/portal/ws/redcap/project'); expect(req.request.body).toEqual({ token: 'secret', rdmp: 'rdmp-1' }); req.flush({ status: true }); await promise; });
});
