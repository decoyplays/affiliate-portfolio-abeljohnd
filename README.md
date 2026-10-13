# SwiUnFix Creator Portfolio

An editable React, TypeScript, and Vite portfolio for short-form TikTok and Shopee affiliate product videos. The project is standalone and uses packages from the public npm registry.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Install and run

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

## Build and preview

```bash
npm run build
npm run preview
```

The production site is generated in `dist/`. `npm run preview` serves that build locally.

## Deploy

The project can be pushed to GitHub and deployed as a static site without a server:

- **Cloudflare Pages build command:** `npm run build`
- **Cloudflare Pages output directory:** `dist`

Set the Cloudflare Pages project root to this project directory if it is stored inside a larger repository.

## Project structure

- `src/` — React application, components, hooks, styles, and content data
- `public/` — product video and image assets, favicon, and robots file
- `index.html` — Vite HTML entry point and page metadata
- `package.json` / `package-lock.json` — npm scripts and dependency lockfile
- `vite.config.ts` — Vite, React, Tailwind CSS, and source alias configuration
- `tsconfig.json` — standalone TypeScript compiler configuration
- `components.json` — component generator configuration

Product media is stored in `public/images/` and `public/videos/` and is copied unchanged into the production build.
