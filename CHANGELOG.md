# Changelog

## Unreleased

### Cloudflare Worker Previews

Cloudflare production builds and Worker Preview builds now use separate build-variable scopes. Both
scopes use `CONVEX_DEPLOY_KEY`. Production receives a production deploy key. Previews Base receives
a Convex project Preview deploy key.

Upgrade an existing deployment as follows:

1. Set the connected Worker name in `wrangler.jsonc`.
2. Set the Cloudflare Build command to `pnpm run deploy:convex`.
3. Set the production Deploy command to `npx wrangler deploy`.
4. Set the Preview command to `npx wrangler preview`.
5. Enable Worker Previews.
6. In Previews Base, replace the copied production `CONVEX_DEPLOY_KEY` with the project Preview
   deploy key.
7. Delete `SAMEBASE_CONVEX_PROJECT` from Previews Base. Keep it in Production.
8. Delete `PREVIEW_CONVEX_DEPLOY_KEY` from the Cloudflare build settings.

No compatibility code reads or deletes `PREVIEW_CONVEX_DEPLOY_KEY`. The operator or upgrade agent
must remove the obsolete provider secret during this upgrade.
