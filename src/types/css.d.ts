// Ambient declaration for global CSS side-effect imports (e.g. `import "./globals.css"`).
// Next.js only ships types for CSS Modules (`*.module.css`), so plain global stylesheets
// have no type declaration and some TS language-server states flag the side-effect import.
declare module "*.css";
