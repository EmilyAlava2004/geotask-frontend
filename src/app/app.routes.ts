import { Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
export const routes: Routes = [
   { path: 'tabs',
    component:TabsComponent,
    children: [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'registrer',
    loadComponent: () => import('./registrer/registrer.page').then( m => m.RegistrerPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'tareas',
    loadComponent: () => import('./tareas/tareas.page').then( m => m.TareasPage)
  },
];
