# Cloudflare Workers Builds

This app uses Cloudflare Workers Builds for production and branch Preview deployments.

## Samebase command interface

Use these commands when you connect the repository:

| Dashboard field | Command                   |
| --------------- | ------------------------- |
| Build command   | `pnpm run build`          |
| Deploy command  | `pnpm run deploy`         |
| Preview command | `pnpm run deploy:preview` |

These command names are the Samebase repository interface. Keep them stable. A repository can
change the scripts behind the commands when its deployment needs change.

Cloudflare can infer `pnpm run build` from the exact `build` script in `package.json`. Keep that
value. Enable Preview builds and set the other two commands as shown above.

Cloudflare can still show an **Enable Worker Previews** banner when the Preview command is
`pnpm run deploy:preview`. Cloudflare documents this button as a command change from an old deploy
command to `npx wrangler preview`. Keep the stable package command because its adapter already runs
`wrangler preview`.

Do not put the Worker name in `wrangler.jsonc`. Workers Builds supplies the connected Worker name
through `WRANGLER_CI_OVERRIDE_NAME`.

## First setup

1. Connect the repository and use the three dashboard commands above.
2. Add the production build variables and secrets.
3. Run the first production deployment.
4. In Worker Settings, open Builds and enable Preview builds for non-production branches.
5. Open the Previews Base build settings.
6. Replace the copied production `CONVEX_DEPLOY_KEY` secret with the Convex project Preview deploy
   key.
7. Delete the copied `SAMEBASE_CONVEX_PROJECT` variable from Previews Base.

Cloudflare copies the production build variables and secrets into Previews Base when Worker
Previews is enabled. Do not start a branch build until you replace the copied production key.

## Build variables and secrets

Use the same secret name with a different value in each build scope:

| Build scope   | Name                      | Type     | Value                                               |
| ------------- | ------------------------- | -------- | --------------------------------------------------- |
| Production    | `CONVEX_DEPLOY_KEY`       | Secret   | Convex production deploy key                        |
| Production    | `SAMEBASE_CONVEX_PROJECT` | Variable | `version=1&teamId=<team-id>&projectId=<project-id>` |
| Previews Base | `CONVEX_DEPLOY_KEY`       | Secret   | Convex project Preview deploy key                   |

Do not add `PREVIEW_CONVEX_DEPLOY_KEY`. Each build scope supplies its key through
`CONVEX_DEPLOY_KEY`.

`SAMEBASE_CONVEX_PROJECT` records the complete Worker-to-Convex-project connection for Samebase.
The build does not read it. Keep it only in Production.

Do not add `VITE_CONVEX_URL`. `convex deploy --cmd` supplies the selected deployment URL to the
frontend build.

## Build order

`pnpm run build` behaves differently in two contexts:

- Outside Workers Builds, it runs only the internal application checks and build.
- Inside Workers Builds, it requires `WORKERS_CI_BRANCH` and `CONVEX_DEPLOY_KEY`. It deploys Convex
  and then runs the internal application build with the selected Convex URL.

During a Workers Build, `scripts/build-cloudflare.ts` runs these operations:

1. It gives each non-production branch an explicit Convex Preview name from `WORKERS_CI_BRANCH`.
2. `convex deploy` runs `pnpm run build:app` with the selected Convex URL.
3. The build verifies that the checked-out commit is still the current branch head.
4. Convex deploys the backend.
5. The script creates missing Convex Auth variables on the same production or Preview deployment.

Cloudflare then runs `pnpm run deploy` for production or `pnpm run deploy:preview` for a branch.
The production command uses Wrangler directly. Wrangler reads `WRANGLER_CI_OVERRIDE_NAME` for this
command. The Preview adapter passes that name to `wrangler preview --worker-name` because the
Preview command does not use it to select the target.

Cloudflare can build more than one commit from one branch at the same time. The branch-head check
stops an older build before it can replace newer Convex functions. It applies to `main` and Preview
branches.

## Local commands

A local build is safe and does not deploy Convex:

```sh
pnpm run build
```

To validate a Worker package without publishing it, pass the Worker name to Wrangler:

```sh
pnpm run deploy:dry-run --name my-worker
```

To publish existing build output to production, use:

```sh
pnpm run deploy --name my-worker
```

For a local Worker Preview, set `CLOUDFLARE_WORKER_NAME` before you run the Preview command.

On macOS or Linux:

```sh
export CLOUDFLARE_WORKER_NAME=my-worker
pnpm run deploy:preview
```

On Windows PowerShell:

```powershell
$env:CLOUDFLARE_WORKER_NAME = "my-worker"
pnpm run deploy:preview
```

The local deploy commands publish the current files in `dist/client`. They do not deploy Convex.

## References

- [Cloudflare Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Cloudflare Workers Builds API reference](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/)
- [Convex custom hosting](https://docs.convex.dev/production/hosting/custom)
