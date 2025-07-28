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
    // Forzar tema claro completamente
    document.body.classList.remove('dark');
    document.documentElement.classList.remove('dark');
    
    // Remover cualquier clase de tema oscuro que pueda existir
    const htmlElement = document.querySelector('html');
    if (htmlElement) {
      htmlElement.classList.remove('dark');
      htmlElement.classList.add('ion-palette-light');
    }

    // Sobrescribir las variables CSS de Ionic para tema claro
    document.documentElement.style.setProperty('--ion-background-color', '#ffffff');
    document.documentElement.style.setProperty('--ion-background-color-rgb', '255,255,255');
    document.documentElement.style.setProperty('--ion-text-color', '#000000');
    document.documentElement.style.setProperty('--ion-text-color-rgb', '0,0,0');
  }
}