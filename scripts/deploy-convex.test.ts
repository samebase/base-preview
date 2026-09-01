// Samebase source build: v1989
import { describe, expect, it } from "vite-plus/test";

import { selectConvexDeployPlan } from "./deploy-convex.ts";

describe("deploy-convex", () => {
  it("requires the branch during Workers Builds", () => {
    expect(() =>
      selectConvexDeployPlan({
        WORKERS_CI: "1",
      }),
    ).toThrow("WORKERS_CI_BRANCH");
  });

  it("uses the selected deployment for the production branch", () => {
    expect(
      selectConvexDeployPlan({
        CONVEX_DEPLOY_KEY: "production-key",
        WORKERS_CI: "1",
        WORKERS_CI_BRANCH: "main",
      }),
    ).toEqual({
      deployArgs: [
        "exec",
        "convex",
        "deploy",
        "--cmd",
        "pnpm run build && node ./scripts/verify-current-branch-head.ts",
      ],
      authArgs: ["./scripts/ensure-convex-auth.ts"],
    });
  });

  it("uses the same preview name for deploy and auth setup", () => {
    expect(
      selectConvexDeployPlan({
        CONVEX_DEPLOY_KEY: "preview-key",
        WORKERS_CI: "true",
        WORKERS_CI_BRANCH: "feature-branch",
      }),
    ).toEqual({
      deployArgs: [
        "exec",
        "convex",
        "deploy",
        "--preview-name",
        "feature-branch",
        "--cmd",
        "pnpm run build && node ./scripts/verify-current-branch-head.ts",
      ],
      authArgs: ["./scripts/ensure-convex-auth.ts", "--preview-name", "feature-branch"],
    });
  });

  it("lets the Convex CLI use the local selected deployment", () => {
    expect(selectConvexDeployPlan({})).toEqual({
      deployArgs: [
        "exec",
        "convex",
        "deploy",
        "--cmd",
        "pnpm run build && node ./scripts/verify-current-branch-head.ts",
      ],
      authArgs: ["./scripts/ensure-convex-auth.ts"],
    });
  });
});
