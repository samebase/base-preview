// Samebase source build: v1989
/// <reference types="node" />
import { spawn } from "node:child_process";
import process from "node:process";
import { pathToFileURL } from "node:url";

const WORKERS_BUILD_COMMAND = "pnpm run build && node ./scripts/verify-current-branch-head.ts";

type ConvexDeployPlan = {
  authArgs: readonly string[];
  deployArgs: readonly string[];
};

function run(command: string, args: readonly string[], env: NodeJS.ProcessEnv) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, [...args], {
      env,
      shell: process.platform === "win32",
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code ?? 1}`));
    });
  });
}

function isWorkersBuild(env: NodeJS.ProcessEnv) {
  return env["WORKERS_CI"] === "1" || env["WORKERS_CI"] === "true";
}

export function selectConvexDeployPlan(env: NodeJS.ProcessEnv): ConvexDeployPlan {
  const branch = env["WORKERS_CI_BRANCH"];
  if (isWorkersBuild(env) && !branch) {
    throw new Error("Workers Builds must provide WORKERS_CI_BRANCH before Convex deploys.");
  }

  const previewArgs = branch && branch !== "main" ? ["--preview-name", branch] : [];

  return {
    deployArgs: ["exec", "convex", "deploy", ...previewArgs, "--cmd", WORKERS_BUILD_COMMAND],
    authArgs: ["./scripts/ensure-convex-auth.ts", ...previewArgs],
  };
}

export async function main(env: NodeJS.ProcessEnv = process.env) {
  const plan = selectConvexDeployPlan(env);
  await run("vp", plan.deployArgs, env);
  await run("node", plan.authArgs, env);
}

const entrypoint = process.argv[1];
if (entrypoint && import.meta.url === pathToFileURL(entrypoint).href) {
  await main();
}
