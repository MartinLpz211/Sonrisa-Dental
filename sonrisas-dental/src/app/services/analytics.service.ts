import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Integración con Google Analytics 4 (gtag.js).
 *
 * - Solo carga el script si `environment.googleAnalyticsId` está configurado
 *   (evita golpear la cuota / ensuciar analíticas durante desarrollo local).
 * - Envía un evento `page_view` manual en cada NavigationEnd, porque en una
 *   SPA el gtag.js "de fábrica" solo ve el primer load y no los cambios de
 *   ruta hechos por el Router de Angular.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly measurementId = environment.googleAnalyticsId;
  private loaded = false;

  /** Debe llamarse una sola vez (desde AppComponent) al arrancar la app. */
  init(): void {
    if (!this.measurementId) {
      return; // Sin ID configurado: no-op (típico en desarrollo).
    }

    this.loadGtagScript();

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.trackPageView(event.urlAfterRedirects));
  }

  private loadGtagScript(): void {
    if (this.loaded) return;
    this.loaded = true;

    const window = this.document.defaultView as Window;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    // send_page_view en false porque manejamos los page_view nosotros mismos
    // vía eventos del Router (ver trackPageView).
    window.gtag('config', this.measurementId, { send_page_view: false });

    const script = this.document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    this.document.head.appendChild(script);
  }

  private trackPageView(url: string): void {
    const window = this.document.defaultView as Window;
    window.gtag?.('event', 'page_view', {
      page_path: url,
      page_location: `${environment.siteUrl.replace(/\/$/, '')}${url}`,
      page_title: this.document.title,
    });
  }

  /** Utilidad para trackear eventos propios (ej. "cita_agendada", "form_contacto"). */
  trackEvent(name: string, params: Record<string, unknown> = {}): void {
    if (!this.measurementId) return;
    const window = this.document.defaultView as Window;
    window.gtag?.('event', name, params);
  }
}
