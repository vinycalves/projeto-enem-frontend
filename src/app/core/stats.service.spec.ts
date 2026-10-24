import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StatsService } from './stats.service';

describe('StatsService', () => {
  let service: StatsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StatsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads the current user stats', () => {
    let attempts = 0;

    service.getMyStats().subscribe((response) => (attempts = response.stats.total_attempts));

    const request = http.expectOne('/api/v1/me/stats');
    expect(request.request.method).toBe('GET');
    request.flush({
      stats: {
        total_attempts: 12,
        correct_attempts: 8,
        accuracy: 0.67,
        questions_answered: 10,
      },
      recent_attempts: [],
    });

    expect(attempts).toBe(12);
  });
});
