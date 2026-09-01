# Cloudflare Workers Builds

This app uses Cloudflare Workers Builds for production and branch Preview deployments.

## Dashboard commands

Use these commands when you connect the repository:

| Dashboard field | Command                   |
| --------------- | ------------------------- |
| Build command   | `pnpm run deploy:convex`  |
| Deploy command  | `pnpm run deploy`         |
| Preview command | `pnpm run deploy:preview` |

Cloudflare detects the exact `build` script in `package.json` and initially enters
`pnpm run build`. Replace that value with `pnpm run deploy:convex`. The `build` script is a pure
application build. It does not deploy Convex.

Enable Preview builds. The Preview command uses the private-beta `wrangler preview` command to
create or update one Worker Preview for each branch.

## Build variables and secrets

Workers Builds has separate settings for the production and Preview triggers. Use the same secret
name with a different value in each trigger:

| Trigger       | Name                      | Type     | Value                                               |
| ------------- | ------------------------- | -------- | --------------------------------------------------- |
| Production    | `CONVEX_DEPLOY_KEY`       | Secret   | Convex production deploy key                        |
| Production    | `SAMEBASE_CONVEX_PROJECT` | Variable | `version=1&teamId=<team-id>&projectId=<project-id>` |
| Previews Base | `CONVEX_DEPLOY_KEY`       | Secret   | Convex project Preview deploy key                   |

Do not add `PREVIEW_CONVEX_DEPLOY_KEY`. Each trigger supplies its key through
`CONVEX_DEPLOY_KEY`.

`SAMEBASE_CONVEX_PROJECT` is a readable Samebase marker for the Worker-to-Convex-project
connection. The build does not read it. Keep the marker only in Production because the connection
applies to the complete Worker.

Do not add `VITE_CONVEX_URL`. `convex deploy --cmd` supplies the selected deployment URL to the
frontend build.

## Build order

The Cloudflare Build command runs these operations:

1. `deploy-convex.ts` reads `WORKERS_CI_BRANCH` and gives non-production branches an explicit Convex
   Preview name.
2. `convex deploy` runs `pnpm run build` with the selected Convex URL.
3. The build verifies that the checked-out commit is still the current branch head.
4. Convex deploys the backend.
5. The script creates missing Convex Auth variables on the same production or Preview deployment.

Cloudflare then runs the production or Preview deploy command. Workers Builds provides the Worker
name through `WRANGLER_CI_OVERRIDE_NAME`. The repository wrapper passes it to `wrangler deploy` as
`--name` and to `wrangler preview` as `--worker-name`.

Cloudflare can build more than one commit from one branch at the same time. The branch-head check
stops an older build before it can replace newer Convex functions. It applies to `main` and Preview
branches.

## Local checks

Use a production dry-run to validate the Worker package without publishing it:

```sh
CLOUDFLARE_WORKER_NAME=my-worker pnpm run deploy:dry-run
```

On Windows PowerShell:

```powershell
$env:CLOUDFLARE_WORKER_NAME = "my-worker"
pnpm run deploy:dry-run
```

Worker Previews do not have a dry-run option.

## References

- [Cloudflare Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Cloudflare Workers Builds API reference](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/)
- [Convex custom hosting](https://docs.convex.dev/production/hosting/custom)
