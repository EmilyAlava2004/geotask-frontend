import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonHeader } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
   imports: [ IonApp, IonRouterOutlet,CommonModule],

})

export class AppComponent {

  constructor() {
  }
  ngOnInit() {
    this.initializeApp();
  }

  initializeApp() {
  const savedTheme = localStorage.getItem('appSettings');

  let theme = 'auto';

  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme);
      theme = parsed.appSettings?.theme || 'auto';
    } catch (e) {
      console.warn('Error al leer tema guardado:', e);
    }
  }

  this.applyTheme(theme);
}
applyTheme(theme: string) {
  let appliedTheme = theme;

  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    appliedTheme = prefersDark ? 'dark' : 'light';
  }
  document.body.setAttribute('color-theme', appliedTheme);
}

}