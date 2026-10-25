import { FunctionKind, FunctionSample } from './function-plot';

export const DESMOS_DEFAULT_API_VERSION = '1.12';
export const DESMOS_SCRIPT_ORIGIN = 'https://www.desmos.com';

export interface DesmosGlobalSource {
  DESMOS_API_KEY?: unknown;
  DESMOS_CONFIG?: {
    apiKey?: unknown;
    apiVersion?: unknown;
  };
}

export interface DesmosSettings {
  apiKey: string;
  apiVersion: string;
  scriptUrl: string;
}

export interface DesmosExpression {
  id?: string;
  latex?: string;
  color?: string;
  lineWidth?: number | string;
  lineOpacity?: number | string;
  hidden?: boolean;
}

export interface DesmosBounds {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

export interface DesmosCalculator {
  setExpression(expression: DesmosExpression): void;
  removeExpression(expression: { id: string }): void;
  setMathBounds(bounds: Partial<DesmosBounds>): void;
  updateSettings(settings: Record<string, unknown>): void;
  resize(): void;
  destroy(): void;
}

export type DesmosCalculatorOptions = Record<string, unknown>;

export interface DesmosApi {
  GraphingCalculator(element: HTMLElement, options?: DesmosCalculatorOptions): DesmosCalculator;
}

/**
 * Resolve a configuração sem inventar chaves. A chave pode vir de
 * `window.DESMOS_CONFIG.apiKey`, `window.DESMOS_API_KEY` ou da meta tag
 * `desmos-api-key` injetada no deploy.
 */
export function resolveDesmosSettings(
  source?: DesmosGlobalSource,
  metaApiKey?: string,
  metaApiVersion?: string,
): DesmosSettings | null {
  const configKey = textValue(source?.DESMOS_CONFIG?.apiKey);
  const globalKey = textValue(source?.DESMOS_API_KEY);
  const apiKey = configKey || globalKey || textValue(metaApiKey);
  if (!isPlausibleApiKey(apiKey)) {
    return null;
  }

  const configVersion = textValue(source?.DESMOS_CONFIG?.apiVersion);
  const versionCandidate = configVersion || textValue(metaApiVersion);
  const apiVersion = /^\d+\.\d+$/.test(versionCandidate)
    ? versionCandidate
    : DESMOS_DEFAULT_API_VERSION;

  return {
    apiKey,
    apiVersion,
    scriptUrl: `${DESMOS_SCRIPT_ORIGIN}/api/v${apiVersion}/calculator.js?apiKey=${encodeURIComponent(apiKey)}`,
  };
}

export function readDesmosSettings(documentRef?: Document): DesmosSettings | null {
  const source =
    typeof globalThis === 'undefined' ? undefined : (globalThis as unknown as DesmosGlobalSource);
  const doc = documentRef ?? (typeof document === 'undefined' ? undefined : document);
  const metaKey = doc?.querySelector<HTMLMetaElement>('meta[name="desmos-api-key"]')?.content;
  const metaVersion = doc?.querySelector<HTMLMetaElement>(
    'meta[name="desmos-api-version"]',
  )?.content;
  return resolveDesmosSettings(source, metaKey, metaVersion);
}

let pendingLoad: Promise<DesmosApi> | null = null;

export function loadDesmosApi(settings: DesmosSettings): Promise<DesmosApi> {
  const existing = readDesmosGlobal();
  if (existing) {
    return Promise.resolve(existing);
  }
  if (pendingLoad) {
    return pendingLoad;
  }
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('O Desmos só pode ser carregado no navegador.'));
  }

  const promise = new Promise<DesmosApi>((resolve, reject) => {
    const script = document.createElement('script');
    let settled = false;
    let timeout = 0;

    const finish = (error?: Error): void => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
      if (error) {
        script.remove();
        reject(error);
        return;
      }
      const api = readDesmosGlobal();
      if (api) {
        resolve(api);
      } else {
        script.remove();
        reject(new Error('O script do Desmos carregou, mas a API não foi encontrada.'));
      }
    };

    timeout = window.setTimeout(
      () => finish(new Error('Tempo esgotado ao carregar a calculadora Desmos.')),
      15_000,
    );
    script.src = settings.scriptUrl;
    script.async = true;
    script.dataset['desmosApi'] = 'true';
    script.onload = () => finish();
    script.onerror = () => finish(new Error('Não foi possível carregar o script do Desmos.'));
    document.head.appendChild(script);
  });

  pendingLoad = promise;
  promise.catch(() => {
    if (pendingLoad === promise) {
      pendingLoad = null;
    }
  });
  return promise;
}

export function buildDesmosLatex(
  kind: FunctionKind,
  a: number,
  b: number,
  c: number,
): string | null {
  if (![a, b, c].every((value) => Number.isFinite(value))) {
    return null;
  }
  if (kind === 'affine') {
    return `y=${latexNumber(a)}x ${sign(b)} ${latexNumber(Math.abs(b))}`;
  }
  if (kind === 'quadratic') {
    return `y=${latexNumber(a)}x^{2} ${sign(b)} ${latexNumber(Math.abs(b))}x ${sign(c)} ${latexNumber(Math.abs(c))}`;
  }
  return `y=${latexNumber(a)}\\cdot ${latexNumber(b)}^{x} ${sign(c)} ${latexNumber(Math.abs(c))}`;
}

export function buildDesmosBounds(
  sample: Pick<FunctionSample, 'minY' | 'maxY'>,
  minX = -10,
  maxX = 10,
): DesmosBounds {
  const minY = Math.min(sample.minY, 0);
  const maxY = Math.max(sample.maxY, 0);
  const padding = Math.max((maxY - minY) * 0.12, 1);
  return {
    left: minX,
    right: maxX,
    bottom: minY - padding,
    top: maxY + padding,
  };
}

function textValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isPlausibleApiKey(apiKey: string): boolean {
  return (
    apiKey.length >= 8 &&
    !/\s/.test(apiKey) &&
    !/^<.*>$/.test(apiKey) &&
    !/(your|cole|insira|exemplo|placeholder|changeme)/i.test(apiKey)
  );
}

function latexNumber(value: number): string {
  const rounded = Math.round(value * 1_000_000) / 1_000_000;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function sign(value: number): '+' | '-' {
  return value < 0 ? '-' : '+';
}

function readDesmosGlobal(): DesmosApi | undefined {
  if (typeof globalThis === 'undefined') {
    return undefined;
  }
  const candidate = (globalThis as { Desmos?: unknown }).Desmos;
  if (
    typeof candidate === 'object' &&
    candidate !== null &&
    typeof (candidate as { GraphingCalculator?: unknown }).GraphingCalculator === 'function'
  ) {
    return candidate as DesmosApi;
  }
  return undefined;
}
