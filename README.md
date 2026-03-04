# PEKO Tilastointi

Frontend is built with Vite and deployed to Firebase Hosting.

## Requirements

- Node.js 22+
- Yarn 1.x

## Scripts

- `yarn dev`: start local Vite dev server
- `yarn build`: create production build to `build/`
- `yarn preview`: preview built app locally

## Deploy Hosting

Build and deploy hosting:

```bash
yarn build
yarn firebase deploy --only hosting
```

## Cloud Functions

Functions live under `functions/` and have their own dependencies:

```bash
yarn --cwd functions install
yarn --cwd functions lint
```

