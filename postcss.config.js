export default {
  plugins: {
    tailwindcss: {}
    // autoprefixer disabled: Tailwind 3.4 + autoprefixer 10.4 throws on generated
    // `@supports (: var(--tw))` when processing backdrop-related utilities.
    // Vite 8 targets es2022; prefix needs are minimal for this app.
  }
}
