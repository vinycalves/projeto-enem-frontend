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
    path: 'visualizacoes',
    title: 'Visualizações · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/visualizations/catalog-page').then((module) => module.CatalogPage),
  },
  {
    path: 'visualizacoes/:slug',
    title: 'Visualização · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/visualizations/visualization-host').then(
        (module) => module.VisualizationHost,
      ),
  },
  {
    path: 'guias',
    title: 'Guias completos do ENEM · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/guides/guide-library').then((module) => module.GuideLibrary),
  },
  {
    path: 'guias/:slug',
    title: 'Guia completo · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/guides/guide-reader').then((module) => module.GuideReader),
  },
  {
    path: 'matematica',
    title: 'Matemática · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/mathematics/guide/mathematics-guide').then(
        (module) => module.MathematicsGuide,
      ),
  },
  {
    path: 'matematica/laboratorio',
    title: 'Laboratório de Matemática · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/mathematics/lab/mathematics-lab').then(
        (module) => module.MathematicsLab,
      ),
  },
  {
    path: 'quimica',
    title: 'Química · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/chemistry/guide/chemistry-guide').then((module) => module.ChemistryGuide),
  },
  {
    path: 'quimica/laboratorio',
    title: 'Laboratório de Química · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/chemistry/lab/chemistry-lab').then((module) => module.ChemistryLab),
  },
  {
    path: 'quimica/tabela-periodica',
    title: 'Tabela periódica · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/chemistry/periodic-table/periodic-table-page').then(
        (module) => module.PeriodicTablePage,
      ),
  },
  {
    path: 'biologia',
    title: 'Laboratório de Biologia · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/biology/biology-page').then((module) => module.BiologyPage),
  },
  {
    path: 'biologia/celula',
    title: 'Célula 3D · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/biology/cell-lab/cell-lab').then((module) => module.CellLab),
  },
  {
    path: 'biologia/taxonomia',
    title: 'Taxonomia · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/biology/taxonomy/taxonomy-page').then((module) => module.TaxonomyPage),
  },
  {
    path: 'provas',
    title: 'Provas · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/exams/exams-page').then((module) => module.ExamsPage),
  },
  {
    path: 'provas/:id',
    title: 'Prova · ENEM Aberto',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/exams/exam-page').then((module) => module.ExamPage),
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
