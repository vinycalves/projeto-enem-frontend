import { HttpInterceptorFn } from '@angular/common/http';

/**
 * The session is an HttpOnly cookie. Sending credentials explicitly is
 * harmless on the same origin and keeps behaviour predictable if the API is
 * served from a different origin during local experimentation.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const isApiRequest = request.url.startsWith('/api/');
  const prepared = isApiRequest ? request.clone({ withCredentials: true }) : request;

  return next(prepared);
};
