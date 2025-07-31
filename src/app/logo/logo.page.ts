import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.page.html',
  styleUrls: ['./logo.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule]
})
export class LogoPage implements OnInit {

  logoPath: string = 'assets/image/Imagen de WhatsApp 2025-07-11 a las 15.56.34_abcd5559.jpg'; // Ruta de tu logo

  constructor(private router: Router) { }

  ngOnInit() {
    // ⏰ Configurar el temporizador para redirigir después de 5 segundos
    setTimeout(() => {
      this.navigateToLogin();
    }, 5000); // 5000ms = 5 segundos
  }

  private navigateToLogin() {
    this.router.navigate(['/login']);
  }

}
