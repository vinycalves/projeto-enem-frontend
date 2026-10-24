import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CalendarService } from './calendar.service';
import { CalendarEvent } from './models';

describe('CalendarService', () => {
  let service: CalendarService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CalendarService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads the ENEM calendar events', () => {
    const event: CalendarEvent = {
      id: 1,
      title: 'Primeiro dia de prova',
      kind: 'prova',
      starts_on: '2026-11-08',
      ends_on: '2026-11-08',
      description: 'Abertura dos portões.',
      source_url: 'https://www.gov.br/inep/',
      confirmed: true,
    };
    let received: CalendarEvent[] = [];

    service.getCalendar().subscribe((response) => (received = response.events));

    const request = http.expectOne('/api/v1/enem/calendar');
    expect(request.request.method).toBe('GET');
    request.flush({ events: [event] });

    expect(received).toHaveLength(1);
    expect(received[0].title).toBe('Primeiro dia de prova');
    expect(received[0].confirmed).toBe(true);
  });
});
