import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('renders the application shell with header and footer', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('.brand-name')?.textContent).toContain('ENEM Aberto');
    expect(compiled.querySelector('app-footer')).toBeTruthy();
    expect(compiled.querySelector('main#conteudo')).toBeTruthy();
  });
});
