# Masagochi — Simulador de Fermentación de Masa Madre

## Qué es
Simulador interactivo que modela en tiempo real el crecimiento de levaduras y bacterias lácticas según parámetros de temperatura, hidratación, harina, altitud y ratio de inoculación.

## Stack
- React 19 + Vite 8
- Tailwind CSS 4
- Recharts (gráficos)
- localStorage (persistencia de estado)

## Estructura
```
src/
├── main.jsx
├── index.css
├── components/
│   ├── Masagochi.jsx        # Componente principal (UI + lógica)
│   ├── MasagochiAvatar.jsx  # Avatar con estados emocionales
│   └── Icons.jsx            # Iconos SVG custom
└── utils/
    ├── model.js             # Parámetros de harinas y ratios
    └── simulation.js        # Ecuaciones diferenciales (Euler)
```

## Deploy
- GitHub Pages via GitHub Actions (push a main → deploy automático)
- Base path: `/masagochi/`
- URL: https://martinlleral.github.io/masagochi

## Convenciones
- Componentes React con hooks funcionales
- Sin dependencias pesadas — stack mínimo
- Lógica de simulación separada en utils/
- Sin backend — todo client-side
