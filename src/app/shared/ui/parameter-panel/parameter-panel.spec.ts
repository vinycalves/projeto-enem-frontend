import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParamDefinition, ParameterPanel } from './parameter-panel';

describe('ParameterPanel', () => {
  let fixture: ComponentFixture<ParameterPanel>;
  let root: HTMLElement;

  const params: ParamDefinition[] = [
    {
      id: 'velocidade',
      label: 'Velocidade',
      kind: 'slider',
      min: 10,
      max: 80,
      step: 1,
      default: 30,
      unit: 'm/s',
    },
    {
      id: 'mostrar',
      label: 'Mostrar',
      kind: 'toggle',
      default: true,
    },
    {
      id: 'par',
      label: 'Par',
      kind: 'select',
      default: 'A-T',
      options: ['A-T', 'C-G'],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ParameterPanel] }).compileComponents();
    fixture = TestBed.createComponent(ParameterPanel);
    fixture.componentRef.setInput('params', params);
    fixture.componentRef.setInput('values', {
      velocidade: 30,
      mostrar: true,
      par: 'A-T',
    });
    root = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('renders metadata-driven controls', () => {
    expect(root.querySelectorAll('.parameter-row').length).toBe(3);
    expect(root.textContent).toContain('Velocidade');
    expect(root.querySelector<HTMLInputElement>('input[type="range"]')?.max).toBe('80');
    expect(root.querySelectorAll('select option').length).toBe(2);
  });

  it('emits changed values from a slider', () => {
    let emitted: Record<string, unknown> | undefined;
    fixture.componentInstance.changed.subscribe((values) => (emitted = values));
    const slider = root.querySelector<HTMLInputElement>('input[type="range"]')!;
    slider.value = '55';
    slider.dispatchEvent(new Event('input'));
    expect(emitted?.['velocidade']).toBe(55);
  });

  it('emits changes from a toggle and a select', () => {
    const emitted: Array<Record<string, unknown>> = [];
    fixture.componentInstance.changed.subscribe((values) => emitted.push(values));

    const toggle = root.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    toggle.checked = false;
    toggle.dispatchEvent(new Event('change'));

    const select = root.querySelector<HTMLSelectElement>('select')!;
    select.value = 'C-G';
    select.dispatchEvent(new Event('change'));

    expect(emitted[0]?.['mostrar']).toBe(false);
    expect(emitted[1]?.['par']).toBe('C-G');
  });
});
