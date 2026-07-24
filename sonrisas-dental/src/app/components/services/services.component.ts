import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DentalService {
  icon: string;
  title: string;
  description: string;
  accent: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css'],
})
export class ServicesComponent {
  services: DentalService[] = [
    {
      icon: '🦷',
      title: 'Limpieza dental',
      description:
        'Eliminamos sarro, placa bacteriana y manchas superficiales para que tus dientes luzcan impecables y se mantengan saludables.',
      accent: '#2196F3',
    },
    {
      icon: '😁',
      title: 'Ortodoncia',
      description:
        'Brackets metálicos, cerámicos o alineadores invisibles para corregir la posición de tus dientes con resultados duraderos.',
      accent: '#1565C0',
    },
    {
      icon: '✨',
      title: 'Blanqueamiento dental',
      description:
        'Tratamiento seguro y eficaz para aclarar el tono de tus dientes varias tonalidades en una sola sesión, sin dañar el esmalte.',
      accent: '#42A5F5',
    },
    {
      icon: '🩺',
      title: 'Extracciones',
      description:
        'Realizamos extracciones simples y quirúrgicas de forma indolora y con los más altos estándares de asepsia y seguridad.',
      accent: '#0D47A1',
    },
  ];
}
