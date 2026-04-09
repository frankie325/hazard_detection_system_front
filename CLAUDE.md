# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

Vue 3 + TypeScript + Vite + Element-Plus + Tailwind CSS + Pinia + Vue Router + Vue I18n

## Commands

```bash
pnpm dev          # Start local development server (opens browser)
pnpm build        # Build for production (runs type checking first)
pnpm serve        # Preview production build
pnpm lint         # Run ESLint
pnpm fix          # Run ESLint with auto-fix
pnpm lint:prettier    # Format all files with Prettier
pnpm lint:stylelint   # Lint styles with Stylelint
pnpm lint:lint-staged # Run lint-staged on staged files
pnpm commit       # Commit using cz-git (conventional commits)
pnpm clean:dev     # Run clean dev script
```

## Project Structure

```
src/
├── api/              # API request functions (axios-based)
├── assets/          # Static assets (images, icons, styles)
├── components/      # Vue components
│   └── core/         # Core components (layouts, charts, forms, tables)
├── config/           # Application configuration
├── directives/       # Vue directives (global)
├── enums/            # TypeScript enums
├── hooks/            # Vue composables/hooks
├── locales/          # i18n translation files
├── mock/             # Mock data
├── plugins/          # Vue plugins (echarts, etc.)
├── router/           # Vue Router configuration
│   ├── guards/       # Route guards (beforeEach, afterEach)
│   ├── modules/      # Route modules
│   └── routes/       # Route definitions
├── store/            # Pinia stores
│   └── modules/      # Store modules
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
│   ├── http/         # Axios wrapper with interceptors
│   ├── navigation/   # Navigation utilities
│   ├── storage/      # Storage utilities
│   └── ui/           # UI utilities
└── views/            # Page components
    └── modules/      # Page modules (dashboard, system, etc.)
```

## Architecture Notes

### Auto-imports

The project uses `unplugin-auto-import` and `unplugin-vue-components` for automatic imports:

- Vue, Vue Router, Pinia, and VueUse hooks are auto-imported
- Element-Plus components are auto-imported and auto-resolved
- Generated type definitions are in `src/types/import/`

### Path Aliases

```typescript
'@'        → 'src/'
'@views'   → 'src/views/'
'@utils'   → 'src/utils/'
'@stores'  → 'src/store/'
'@styles'  → 'src/assets/styles/'
'@plugins' → 'src/plugins/'
'@imgs'    → 'src/assets/images/'
'@icons'   → 'src/assets/icons/'
```

### State Management

Pinia with `pinia-plugin-persistedstate` for localStorage persistence. Storage keys are versioned via `StorageKeyManager` to handle data migrations.

### HTTP Layer

Axios-based request utility in `src/utils/http/` with:

- Request/response interceptors (auto Token injection)
- 401 handling with auto-logout (debounced)
- Configurable retry logic
- Unified error handling

### Router

Hash-mode routing with route guards for permission checking. Static routes in `src/router/routes/staticRoutes.ts` and dynamic routes loaded from backend.

### CSS/Styling

- Tailwind CSS v4 via `@tailwindcss/vite`
- SCSS with Element Plus theming
- Global SCSS mixins and variables auto-injected via `vite.config.ts`

### Environment Variables

Key variables in `.env`:

- `VITE_API_URL` - API base URL
- `VITE_API_PROXY_URL` - Development proxy target
- `VITE_ACCESS_MODE` - Permission mode (frontend/backend)
- `VITE_LOCK_ENCRYPT_KEY` - Screen lock encryption key
