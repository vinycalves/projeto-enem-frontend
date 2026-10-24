import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SupportService } from '../../core/support.service';
import { AboutPage } from './about-page';

describe('AboutPage', () => {
  let fixture: ComponentFixture<AboutPage>;
  let root: HTMLElement;
  let supportMock: { getPixKey: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    supportMock = {
      getPixKey: vi.fn(() => of('pix@example.com')),
    };

    await TestBed.configureTestingModule({
      imports: [AboutPage],
      providers: [{ provide: SupportService, useValue: supportMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutPage);
    root = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('does not request the Pix key on page load', () => {
    expect(supportMock.getPixKey).not.toHaveBeenCalled();
    expect(root.querySelector('.pix-key')).toBeNull();
  });

  it('reveals the Pix key only after the support button is clicked', async () => {
    const button = root.querySelector<HTMLButtonElement>('.support-panel .btn--primary');
    expect(button).toBeTruthy();

    button!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(supportMock.getPixKey).toHaveBeenCalledTimes(1);
    expect(root.querySelector('.pix-key')?.textContent).toContain('pix@example.com');
  });

  it('shows an informative state when the backend has no Pix key', async () => {
    supportMock.getPixKey.mockImplementation(() => of(null));

    root.querySelector<HTMLButtonElement>('.support-panel .btn--primary')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(root.textContent).toContain('A chave Pix ainda não foi configurada');
  });
});
