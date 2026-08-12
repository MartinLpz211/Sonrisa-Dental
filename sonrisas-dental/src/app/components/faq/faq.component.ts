import { DOCUMENT } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Sección de Preguntas Frecuentes de la landing pública.
 *
 * Además del acordeón visual, inyecta un <script type="application/ld+json">
 * con el esquema FAQPage de schema.org: eso es lo que le permite a Google
 * mostrar estas preguntas como "rich result" desplegable directo en los
 * resultados de búsqueda.
 */
@Component({
  selector: 'app-faq',
  standalone: true,
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'],
})
export class FaqComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private structuredDataScript: HTMLScriptElement | null = null;

  readonly faqs: FaqItem[] = [
    {
      question: '¿Necesito cita previa o atienden urgencias el mismo día?',
      answer:
        'Trabajamos principalmente con citas agendadas para poder dedicarte el tiempo necesario, pero reservamos espacios cada día para urgencias (dolor, fracturas, inflamación). Llámanos o agenda en línea y te confirmamos el horario más cercano disponible.',
    },
    {
      question: '¿Qué formas de pago aceptan?',
      answer:
        'Aceptamos efectivo, tarjeta de débito/crédito y transferencia. Para tratamientos más extensos (ortodoncia, implantes) ofrecemos planes de pago en mensualidades, sin intereses.',
    },
    {
      question: '¿Trabajan con seguros dentales?',
      answer:
        'Sí, emitimos facturas y recibos compatibles con la mayoría de las aseguradoras dentales en México. Te recomendamos confirmar tu cobertura específica con tu aseguradora antes de la consulta.',
    },
    {
      question: '¿Cómo es la primera consulta?',
      answer:
        'La primera cita incluye valoración clínica, revisión de tu historial médico-dental y, si es necesario, radiografías digitales. Al final te explicamos un plan de tratamiento claro, con tiempos y costos, antes de comenzar cualquier procedimiento.',
    },
    {
      question: '¿Atienden niños?',
      answer:
        'Sí, contamos con odontopediatría para pacientes desde los primeros dientes hasta la adolescencia, con un enfoque preventivo y ambientado para que la visita sea una experiencia tranquila.',
    },
    {
      question: '¿Cada cuánto debo hacerme una limpieza dental?',
      answer:
        'La recomendación general es cada 6 meses, aunque en pacientes con ortodoncia, gingivitis o mayor acumulación de sarro puede ser cada 3-4 meses. Te lo indicamos en tu revisión inicial.',
    },
  ];

  /** Índice del acordeón abierto (null = todos cerrados). */
  readonly openIndex = signal<number | null>(0);

  toggle(index: number): void {
    this.openIndex.update((current) => (current === index ? null : index));
  }

  ngOnInit(): void {
    this.injectStructuredData();
  }

  ngOnDestroy(): void {
    this.structuredDataScript?.remove();
  }

  private injectStructuredData(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: this.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.document.head.appendChild(script);
    this.structuredDataScript = script;
  }
}
