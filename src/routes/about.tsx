import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="text-xl">Worker Preview test</h1>
      <p>This branch proves that Cloudflare Worker Previews use their own Convex deployment.</p>
    </main>
  );
}
