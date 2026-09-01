# Cloudflare Workers Builds

This app uses Cloudflare Workers Builds for production and branch Preview deployments.

## Repository requirement

Set the connected Worker name in `wrangler.jsonc`:

```jsonc
{
  "name": "base-preview",
}
```

The private-beta `wrangler preview` command needs this value. Workers Builds sets
`WRANGLER_CI_OVERRIDE_NAME`, but Wrangler 4.118.0 does not use that value to resolve the target of
the Preview command.

## Dashboard commands

Use these commands when you connect the repository:

| Dashboard field | Command                  |
| --------------- | ------------------------ |
| Build command   | `pnpm run deploy:convex` |
| Deploy command  | `npx wrangler deploy`    |
| Preview command | `npx wrangler preview`   |

Cloudflare detects the package manager from the repository metadata. It enters `pnpm run build`
only when `package.json` has the exact `build` script. A `build:*` script, Vite, TanStack Start, or
Wrangler does not cause Cloudflare to enter a Build command.

Replace the inferred `pnpm run build` value with `pnpm run deploy:convex`. Keep `pnpm run build` as
a pure application build. The shared Cloudflare Build step must select and deploy the correct
Convex deployment before the production or Preview Worker command runs.

## First setup

1. Connect the repository and use the three dashboard commands above.
2. Add the production build variables and secrets.
3. Run the first production deployment.
4. In Worker Settings, open Builds and enable Worker Previews.
5. Open the Previews Base tab.
6. Replace the copied production `CONVEX_DEPLOY_KEY` secret with the Convex project Preview deploy
   key.
7. Delete the copied `SAMEBASE_CONVEX_PROJECT` variable from Previews Base.

Cloudflare copies the production build variables and secrets into Previews Base when Worker
Previews is enabled. Do not start a branch build until the copied production key is replaced.

## Build variables and secrets

Use the same secret name with a different value in each build scope:

| Build scope   | Name                      | Type     | Value                                               |
| ------------- | ------------------------- | -------- | --------------------------------------------------- |
| Production    | `CONVEX_DEPLOY_KEY`       | Secret   | Convex production deploy key                        |
| Production    | `SAMEBASE_CONVEX_PROJECT` | Variable | `version=1&teamId=<team-id>&projectId=<project-id>` |
| Previews Base | `CONVEX_DEPLOY_KEY`       | Secret   | Convex project Preview deploy key                   |

Do not add `PREVIEW_CONVEX_DEPLOY_KEY`. Each build scope supplies its key through
`CONVEX_DEPLOY_KEY`.

`SAMEBASE_CONVEX_PROJECT` is a readable Samebase marker for the complete Worker-to-Convex-project
connection. The build does not read it. Keep it only in Production.

Do not add `VITE_CONVEX_URL`. `convex deploy --cmd` supplies the selected deployment URL to the
frontend build.

## Build order

The shared Cloudflare Build command runs these operations:

1. `deploy-convex.ts` reads `WORKERS_CI_BRANCH` and gives a non-production branch an explicit Convex
   Preview name.
2. `convex deploy` runs `pnpm run build` with the selected Convex URL.
3. The build verifies that the checked-out commit is still the current branch head.
4. Convex deploys the backend.
5. The script creates missing Convex Auth variables on the same production or Preview deployment.

Cloudflare then runs `wrangler deploy` for production or `wrangler preview` for a branch. The
Wrangler file supplies the Worker name for both commands.

Cloudflare can build more than one commit from one branch at the same time. The branch-head check
stops an older build before it can replace newer Convex functions. It applies to `main` and Preview
branches.

## Local commands

Use one command for a complete local provider deployment:

```sh
pnpm run deploy
```

Use a production dry-run to validate the Worker package without publishing it:

```sh
pnpm run deploy:dry-run
```

Worker Previews do not have a dry-run option.

## References

- [Cloudflare Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Cloudflare Workers Builds API reference](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/)
- [Convex custom hosting](https://docs.convex.dev/production/hosting/custom)
