# Masagochi v3.0 Bio

Simulador interactivo de fermentación de masa madre que modela en tiempo real el crecimiento de levaduras y bacterias lácticas según parámetros como temperatura, hidratación, tipo de harina, altitud y ratio de inoculación.

## Stack

- **React 19** + **Vite 8**
- **Recharts** para gráficos de línea
- **Tailwind CSS 4** para estilos
- **GitHub Pages** con deploy automático vía GitHub Actions

## Funcionalidades

- Simulación de fermentación basada en ecuaciones diferenciales (integración de Euler)
- Modelado de poblaciones de levaduras (Saccharomyces) y bacterias lácticas (LAB)
- Parámetros ajustables: temperatura, hidratación, tipo de harina, origen, ratio de inoculación y altitud
- Gráficos interactivos de evolución poblacional, acidez, gas y nutrientes
- Historial de ciclos de refresco para seguir la evolución de la masa madre
- Diseño responsive y estética limpia

## Desarrollo local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Demo

[Ver demo en vivo](https://martinlleral.github.io/masagochi)

## Autor

Martín Lleral - [GitHub](https://github.com/martinlleral)
