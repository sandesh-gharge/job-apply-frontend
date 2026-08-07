---
name: styling-pattern
description: Follows the established CSS/SCSS styling patterns for the Angular 21 JobApply project.
---

# Styling Pattern for JobApply

When styling components or updating the UI for the JobApply Angular 21 project, you MUST strictly adhere to the following patterns. Do not use Tailwind CSS or any external styling libraries unless explicitly requested.

## 1. Component-Scoped SCSS
- Every component should have its own corresponding `.scss` file.
- Use SCSS nesting to keep styles modular and scoped.
- Examples of class names: loosely follow BEM or functional class names like `.panel`, `.panel-title`, `.stat-card`, `.activity-row`.

## 2. CSS Custom Properties (Variables)
Always use the global CSS custom properties defined in `src/styles.scss`. These support the application's light/dark mode functionality out of the box. Do not hardcode colors (e.g., `#ffffff` or `black`) unless absolutely necessary.

### Key Variable Categories
- **Backgrounds:** `var(--bg-body)`, `var(--bg-card)`, `var(--bg-subtle)`, `var(--bg-hover)`
- **Text/Typography:** `var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)`, `var(--text-light)`
- **Borders:** `var(--border-color)`, `var(--border-dark)`
- **Brand Colors:** `var(--primary)`, `var(--primary-hover)`, `var(--primary-light)`, `var(--primary-light-text)`
- **Status Colors:** 
  - Success: `var(--success)`, `var(--success-bg)`, `var(--success-text)`
  - Warning: `var(--warning)`, `var(--warning-bg)`, `var(--warning-text)`
  - Error: `var(--error)`, `var(--error-bg)`, `var(--error-text)`
- **Shadows:** `var(--shadow)`, `var(--shadow-sm)`

## 3. Modern CSS Layouts
- **Flexbox and Grid:** Use `display: flex; gap: 1rem;` or `display: grid; grid-template-columns: ...` for layouts instead of floats or excessive margins.
- **Responsiveness:** Use native media queries (`@media (max-width: ...px)`) within the component SCSS to handle responsiveness.

## 4. UI Elements and Animations
- Use predefined `.skeleton` classes or simple keyframe animations (like `fadeIn` or `pulseFade`) for loading states.
- Round corners using pixel values like `border-radius: 8px` or `12px` to match the existing UI.

## Summary Checklist
1. Did you use `var(--variable-name)` for all colors and backgrounds?
2. Are styles scoped in the component's SCSS file?
3. Is Flexbox or Grid used for layout with `gap`?
4. Are hover effects and transitions smooth?

By following these rules, the app maintains a premium, cohesive, and fully responsive design that automatically adapts to light and dark themes.
