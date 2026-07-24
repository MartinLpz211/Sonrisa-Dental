# 🦷 Sonrisas — Consultorio Dental

Sitio web moderno para el consultorio dental **Sonrisas**, construido con **Angular 20** y componentes standalone.

---

## ⚡ Inicio rápido

### 1. Crear el proyecto (si empiezas desde cero)

```bash
npm install -g @angular/cli
ng new sonrisas-dental --standalone --style=css --routing=false
cd sonrisas-dental
```

### 2. Si ya tienes los archivos del proyecto

```bash
# Entra al directorio del proyecto
cd sonrisas-dental

# Instala dependencias
npm install

# Inicia el servidor de desarrollo
npm start
# o bien:
ng serve
```

La aplicación estará disponible en: **http://localhost:4200**

---

## 🏗️ Estructura del proyecto

```
sonrisas-dental/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── header/
│   │   │   │   ├── header.component.ts
│   │   │   │   ├── header.component.html
│   │   │   │   └── header.component.css
│   │   │   ├── hero/
│   │   │   │   ├── hero.component.ts
│   │   │   │   ├── hero.component.html
│   │   │   │   └── hero.component.css
│   │   │   ├── services/
│   │   │   │   ├── services.component.ts
│   │   │   │   ├── services.component.html
│   │   │   │   └── services.component.css
│   │   │   ├── about/
│   │   │   │   ├── about.component.ts
│   │   │   │   ├── about.component.html
│   │   │   │   └── about.component.css
│   │   │   ├── contact/
│   │   │   │   ├── contact.component.ts
│   │   │   │   ├── contact.component.html
│   │   │   │   └── contact.component.css
│   │   │   └── footer/
│   │   │       ├── footer.component.ts
│   │   │       ├── footer.component.html
│   │   │       └── footer.component.css
│   │   ├── app.component.ts
│   │   └── app.config.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧩 Componentes

| Componente | Selector | Descripción |
|---|---|---|
| `AppComponent` | `app-root` | Raíz — orquesta todos los componentes |
| `HeaderComponent` | `app-header` | Navbar fija con logo y menú responsive |
| `HeroComponent` | `app-hero` | Sección principal con CTA |
| `ServicesComponent` | `app-services` | Tarjetas de servicios dentales |
| `AboutComponent` | `app-about` | Historia y estadísticas del consultorio |
| `ContactComponent` | `app-contact` | Formulario de contacto con validación |
| `FooterComponent` | `app-footer` | Pie de página con enlaces y créditos |

---

## 🎨 Sistema de diseño (CSS Custom Properties)

```css
--color-primary:       #2196F3   /* Azul principal */
--color-primary-dark:  #1565C0   /* Azul oscuro (hover) */
--color-primary-light: #E3F2FD   /* Azul claro (fondos) */
--color-white:         #FFFFFF
--color-gray-light:    #F5F5F5   /* Fondos de secciones */
--color-dark:          #1A237E   /* Títulos */
```

---

## 🐦 Logo — Chorlito egipcio

El logo usa un SVG inline del **chorlito egipcio** (*Pluvianus aegyptius*),
un ave famosa por limpiar los dientes de los cocodrilos — metáfora perfecta
para un consultorio dental.

---

## 📦 Comandos útiles

```bash
npm start          # Servidor de desarrollo (http://localhost:4200)
npm run build      # Build de producción → dist/sonrisas-dental/
ng generate component components/nueva-seccion --standalone  # Nuevo componente
```

---

## 🔧 Tecnologías

- **Angular 20** — Standalone Components, Signals, `@for` control flow
- **TypeScript 5.8**
- **CSS puro** con Custom Properties (sin frameworks de UI)
- **Google Fonts** — Nunito + Open Sans
