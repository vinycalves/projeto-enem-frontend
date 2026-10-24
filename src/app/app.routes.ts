import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Início · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home-page').then((module) => module.HomePage),
  },
  {
    path: 'login',
    title: 'Entrar · ENEM Aberto',
    loadComponent: () => import('./features/login/login-page').then((module) => module.LoginPage),
  },
  {
    path: 'estudar',
    title: 'Estudar · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () => import('./features/study/study-page').then((module) => module.StudyPage),
  },
  {
    path: 'conceito/:id',
    title: 'Conceito · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/concept/concept-page').then((module) => module.ConceptPage),
  },
  {
    path: 'questao/:id',
    title: 'Questão · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/question/question-page').then((module) => module.QuestionPage),
  },
  {
    path: 'calendario',
    title: 'Calendário · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/calendar/calendar-page').then((module) => module.CalendarPage),
  },
  {
    path: 'sobre',
    title: 'Sobre · ENEM Aberto',
    loadComponent: () => import('./features/about/about-page').then((module) => module.AboutPage),
  },
  { path: '**', redirectTo: '' },
];
