# Changelog

## Unreleased

### Cloudflare Worker Previews

Cloudflare production builds and Worker Preview builds now use separate build-variable scopes. Both
scopes use `CONVEX_DEPLOY_KEY`. Production receives a production deploy key. Previews Base receives
a Convex project Preview deploy key.

The repository keeps one stable deployment interface:

- Build command: `pnpm run build`
- Deploy command: `pnpm run deploy`
- Preview command: `pnpm run deploy:preview`

The Worker name now comes from Cloudflare at run time. The repository does not store it in
`wrangler.jsonc`.

Upgrade an existing deployment as follows:

1. Update the repository scripts and remove the Worker name from `wrangler.jsonc`.
2. Set the Cloudflare Build command to `pnpm run build`.
3. Set the production Deploy command to `pnpm run deploy`.
4. Set the Preview command to `pnpm run deploy:preview`.
5. Enable Worker Previews.
6. In the production build settings, keep the production `CONVEX_DEPLOY_KEY` and
   `SAMEBASE_CONVEX_PROJECT`.
7. In Previews Base build settings, replace the copied production `CONVEX_DEPLOY_KEY` with the
   project Preview deploy key.
8. Delete `SAMEBASE_CONVEX_PROJECT` from Previews Base.
9. Delete `PREVIEW_CONVEX_DEPLOY_KEY` from all Cloudflare build settings.

No compatibility code reads or deletes `PREVIEW_CONVEX_DEPLOY_KEY`. The operator or upgrade agent
must remove the obsolete provider secret during this upgrade.
