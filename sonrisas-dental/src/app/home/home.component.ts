import { Component } from '@angular/core';
import { HeroComponent } from '../components/hero/hero.component';
import { ServicesComponent } from '../components/services/services.component';
import { AboutComponent } from '../components/about/about.component';
import { ContactComponent } from '../components/contact/contact.component';

/**
 * Página de inicio (landing pública). Se separó de AppComponent al
 * introducir el router: ahora AppComponent solo aloja el Header, el
 * <router-outlet> y el Footer, y cada ruta (Home, Login, Registro,
 * dashboards...) es su propio componente.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, ServicesComponent, AboutComponent, ContactComponent],
  template: `
    <app-hero></app-hero>
    <app-services></app-services>
    <app-about></app-about>
    <app-contact></app-contact>
  `,
})
export class HomeComponent {}
