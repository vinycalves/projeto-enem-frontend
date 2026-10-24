import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SupportService } from './support.service';

describe('SupportService', () => {
  let service: SupportService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SupportService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads the Pix key from the backend', () => {
    let received: string | null | undefined;

    service.getPixKey().subscribe((key) => (received = key));

    const request = http.expectOne('/api/v1/support/pix');
    expect(request.request.method).toBe('GET');
    request.flush({ key: 'pix@example.com' });

    expect(received).toBe('pix@example.com');
  });

  it('returns null when the backend has no Pix key configured', () => {
    let received: string | null | undefined;

    service.getPixKey().subscribe((key) => (received = key));

    http
      .expectOne('/api/v1/support/pix')
      .flush(
        { error: { code: 'not_found', message: 'Chave não configurada.' } },
        { status: 404, statusText: 'Not Found' },
      );

    expect(received).toBeNull();
  });
});
