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
}
