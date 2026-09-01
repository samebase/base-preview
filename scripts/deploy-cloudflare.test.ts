// Samebase source build: v1989
import { describe, expect, it } from "vite-plus/test";

import { selectCloudflareDeployPlan } from "./deploy-cloudflare.ts";

describe("deploy-cloudflare", () => {
  it("uses the pure build for a local dry-run", () => {
    expect(
      selectCloudflareDeployPlan(["deploy", "--dry-run"], {
        CLOUDFLARE_WORKER_NAME: "example-app",
      }),
    ).toEqual({
      buildArgs: ["run", "build"],
      wranglerArgs: ["deploy", "--name", "example-app", "--dry-run"],
    });
  });

  it("recognizes Wrangler's explicit true dry-run value", () => {
    expect(
      selectCloudflareDeployPlan(["deploy", "--dry-run=true"], {
        CLOUDFLARE_WORKER_NAME: "example-app",
      }),
    ).toEqual({
      buildArgs: ["run", "build"],
      wranglerArgs: ["deploy", "--name", "example-app", "--dry-run=true"],
    });
  });

  it("keeps Wrangler's explicit false dry-run value on the deploy path", () => {
    expect(
      selectCloudflareDeployPlan(["deploy", "--dry-run=false"], {
        CLOUDFLARE_WORKER_NAME: "example-app",
      }),
    ).toEqual({
      buildArgs: ["run", "deploy:convex"],
      wranglerArgs: ["deploy", "--name", "example-app", "--dry-run=false"],
    });
  });

  it("deploys Convex before a local Worker Preview", () => {
    expect(
      selectCloudflareDeployPlan(["preview"], {
        CLOUDFLARE_WORKER_NAME: "example-app",
      }),
    ).toEqual({
      buildArgs: ["run", "deploy:convex"],
      wranglerArgs: ["preview", "--worker-name", "example-app"],
    });
  });

  it("does not repeat the build during Workers Builds", () => {
    expect(
      selectCloudflareDeployPlan(["deploy"], {
        WORKERS_CI: "true",
        WRANGLER_CI_OVERRIDE_NAME: "connected-worker",
      }),
    ).toEqual({
      buildArgs: null,
      wranglerArgs: ["deploy", "--name", "connected-worker"],
    });
  });

  it("rejects Wrangler flags that can replace the connected Worker name", () => {
    const env = { CLOUDFLARE_WORKER_NAME: "example-app" };

    expect(() => selectCloudflareDeployPlan(["deploy", "--name", "other"], env)).toThrow(
      "Do not pass a Wrangler Worker name manually",
    );
    expect(() => selectCloudflareDeployPlan(["deploy", "--name=other"], env)).toThrow(
      "Do not pass a Wrangler Worker name manually",
    );
    expect(() => selectCloudflareDeployPlan(["deploy", "-n", "other"], env)).toThrow(
      "Do not pass a Wrangler Worker name manually",
    );
    expect(() => selectCloudflareDeployPlan(["preview", "--worker-name", "other"], env)).toThrow(
      "Do not pass a Wrangler Worker name manually",
    );
  });

  it("rejects dry-runs for Worker Previews", () => {
    expect(() =>
      selectCloudflareDeployPlan(["preview", "--dry-run"], {
        CLOUDFLARE_WORKER_NAME: "example-app",
      }),
    ).toThrow("Worker Previews do not support --dry-run");
  });

  it("rejects an option terminator that can hide a later dry-run flag", () => {
    expect(() =>
      selectCloudflareDeployPlan(["deploy", "--", "--dry-run=true"], {
        CLOUDFLARE_WORKER_NAME: "example-app",
      }),
    ).toThrow("Do not pass a standalone -- to Wrangler");
  });
});
