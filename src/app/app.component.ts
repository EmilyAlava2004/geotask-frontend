import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonHeader } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonMenu,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  MenuController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mapSharp, settingsSharp, checkboxSharp } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
   imports: [ IonContent, IonTitle, IonToolbar, IonHeader, IonApp, IonRouterOutlet, IonMenu,CommonModule, IonList, IonItem, IonIcon, IonLabel],

})

export class AppComponent {
  showMenu = true;  // al inicio visible

  constructor(
    private menuController: MenuController,
    private router: Router
  ) {
    addIcons({
      mapSharp,
      settingsSharp,
      checkboxSharp
    });

    this.router.events.subscribe(() => {
      this.updateMenuVisibility();
    });
  }

 updateMenuVisibility() {
  const currentRoute = this.router.url;
  if (currentRoute.includes('/login') || currentRoute.includes('/registrer')||currentRoute.includes('/tabs/perfil')) {
    this.showMenu = false;
  } else {
    this.showMenu = true;
  }
}


  async navigateAndClose(route: string) {
    await this.menuController.close();
    this.router.navigate([route]);
  }
}
