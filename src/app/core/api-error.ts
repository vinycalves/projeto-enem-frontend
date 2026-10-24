import { HttpErrorResponse } from '@angular/common/http';

interface ApiErrorEnvelope {
  error?: {
    code?: string;
    message?: string;
  };
}

const STATUS_MESSAGES: Record<number, string> = {
  0: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
  400: 'Os dados enviados não são válidos. Revise as informações e tente novamente.',
  401: 'Sua sessão expirou ou as credenciais não são válidas. Entre novamente.',
  403: 'Você ainda não tem acesso a este conteúdo.',
  404: 'Não encontramos o conteúdo solicitado.',
  409: 'Já existe um registro com estes dados.',
  422: 'Alguns campos precisam de atenção. Revise o formulário.',
  429: 'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.',
  500: 'O servidor encontrou um problema. Tente novamente em instantes.',
  502: 'O servidor está temporariamente indisponível. Tente novamente em instantes.',
  503: 'O serviço está temporariamente indisponível. Tente novamente em instantes.',
};

export function getApiErrorStatus(error: unknown): number | null {
  return error instanceof HttpErrorResponse ? error.status : null;
}

export function getApiErrorCode(error: unknown): string | null {
  if (!(error instanceof HttpErrorResponse)) {
    return null;
  }

  const envelope = error.error as ApiErrorEnvelope | null;
  return envelope?.error?.code ?? null;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Algo deu errado. Tente novamente.',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const envelope = error.error as ApiErrorEnvelope | null;
  const serverMessage = envelope?.error?.message;

  if (typeof serverMessage === 'string' && serverMessage.trim().length > 0) {
    return serverMessage;
  }

  return STATUS_MESSAGES[error.status] ?? fallback;
}
