Global Styles Folder Structure
This document explains the purpose of each SCSS file in the `src/styles/` directory of the Angular project. Organizing styles this way helps maintain a scalable and maintainable design system.
Folder: src/styles/
•	├── _variables.scss
Contains global design tokens like colors, spacing units, font sizes, and border radii.
•	├── _mixins.scss
Holds reusable SCSS mixins such as media queries and flex utilities.
•	├── _utilities.scss
Defines utility classes for common layout helpers (e.g., margin, padding, display).
•	├── _responsive.scss
Manages responsive behaviors like breakpoints, container sizing, and fluid images.
•	└── styles.scss
Main global stylesheet. It imports all partials above and includes Material theme setup. This file is declared in angular.json.

