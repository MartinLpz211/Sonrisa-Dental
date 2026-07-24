import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent {
  stats = [
    { value: '10+', label: 'Años de experiencia' },
    { value: '5k+', label: 'Pacientes atendidos' },
    { value: '4',   label: 'Especialidades' },
    { value: '98%', label: 'Satisfacción' },
  ];
}
