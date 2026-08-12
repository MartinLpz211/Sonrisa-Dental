import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../environments/environment.production';

export interface SeoRouteData {
  /** Meta description específica de la ruta (≈150-160 caracteres). */
  description?: string;
  /**
   * Ruta usada para construir la URL canónica y og:url.
   * Si no se especifica, se usa la URL actual (sin query params).
   */
  canonicalPath?: string;
  /** Permite marcar rutas privadas (dashboards) como "noindex, nofollow". */
  noIndex?: boolean;
}

/**
 * Centraliza el SEO "on-page" de las rutas públicas: <title>, meta
 * description, <link rel="canonical">, Open Graph y Twitter Card, y
 * robots. Se suscribe a NavigationEnd y lee `route.data` para no tener
 * que repetir esta lógica en cada componente de página.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  private readonly defaultDescription =
    'Consultorio dental Sonrisas — atención odontológica profesional para toda la familia en Querétaro, México. Agenda tu cita en línea.';

  /** Debe llamarse una sola vez (desde AppComponent) al arrancar la app. */
  init(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.updateFromRoute());

    // Primera carga (NavigationEnd no dispara antes de la suscripción).
    this.updateFromRoute();
  }

  private updateFromRoute(): void {
    let snapshot: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
    let data: SeoRouteData = {};
    while (snapshot.firstChild) {
      snapshot = snapshot.firstChild;
      data = { ...data, ...(snapshot.data as SeoRouteData) };
    }

    const pageTitle = this.title.getTitle() || 'Sonrisas Dental';
    const description = data.description ?? this.defaultDescription;
    const path = data.canonicalPath ?? this.router.url.split('?')[0].split('#')[0];
    const canonicalUrl = `${environment.siteUrl.replace(/\/$/, '')}${path}`;

    this.setDescription(description);
    this.setCanonical(canonicalUrl);
    this.setOpenGraph(pageTitle, description, canonicalUrl);
    this.setRobots(data.noIndex ?? false);
  }

  private setDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
  }

  private setRobots(noIndex: boolean): void {
    this.meta.updateTag({
      name: 'robots',
      content: noIndex ? 'noindex, nofollow' : 'index, follow',
    });
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setOpenGraph(title: string, description: string, url: string): void {
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Sonrisas Dental' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:locale', content: 'es_MX' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }
}
