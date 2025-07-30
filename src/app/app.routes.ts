import { Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsComponent,
    canActivate: [AuthGuard], // ✅ protege todo lo que está dentro de tabs
    children: [
      {
        path: 'home',
        canActivate: [AuthGuard],
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'tareas',
        canActivate: [AuthGuard],
        loadComponent: () => import('./tareas/tareas.page').then((m) => m.TareasPage),
      },
      {
        path: 'mapa',
        canActivate: [AuthGuard],
        loadComponent: () => import('./mapa/mapa.page').then((m) => m.MapaPage),
      },
      {
        path: 'perfil',
        canActivate: [AuthGuard],
        loadComponent: () => import('./perfil/perfil.page').then((m) => m.PerfilPage),
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      }
    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'registrer',
    loadComponent: () => import('./registrer/registrer.page').then((m) => m.RegistrerPage),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then((m) => m.SettingsPage),
    canActivate: [AuthGuard]
  }
];
