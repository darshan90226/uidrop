# Contributing to UIDrop

Thanks for considering a contribution!

## Before opening a pull request

1. Open an issue or discussion describing a large change.
2. Keep components responsive and keyboard-friendly.
3. Avoid adding dependencies for small features.
4. Include a screenshot or short recording for visual changes.
5. Never submit code or assets you do not have permission to share.

## Local development

- Frontend-only: `cd client && npm install && npm run dev`
- Full stack: configure `server/.env`, install dependencies at the root, run `npm run db:setup --workspace server`, then `npm run dev`.

## Component contributions

Include a clear name, category, concise description, and accessible interaction states. Keep styles scoped to the component so they do not leak into other examples.
