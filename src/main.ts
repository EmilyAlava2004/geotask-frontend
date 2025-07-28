import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './app/interceptors/token.interceptor';
import { importProvidersFrom, APP_INITIALIZER } from '@angular/core'; // ✅
import { IonicStorageModule } from '@ionic/storage-angular';
import { StorageService } from './app/services/storage.service'; // ✅

export function initializeStorage(storageService: StorageService) {
  return () => storageService.init();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([tokenInterceptor])),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(IonicStorageModule.forRoot()),
    // ✅ Este bloque garantiza que init() se ejecute antes de arrancar la app
    {
      provide: APP_INITIALIZER,
      useFactory: initializeStorage,
      deps: [StorageService],
      multi: true
    }
  ],
});
