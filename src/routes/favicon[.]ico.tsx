import { createFileRoute } from "@tanstack/react-router";

// Inline SVG favicon: neon "E" monogram on dark studio background.
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#1a0d2e"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
    font-family="ui-monospace, SFMono-Regular, Menlo, monospace"
    font-weight="900" font-size="40" fill="#ff2bd6"
    style="filter: drop-shadow(0 0 4px #ff2bd6) drop-shadow(0 0 8px #00f5ff)">E</text>
</svg>`;

export const Route = createFileRoute("/favicon.ico")({
  server: {
    handlers: {
      GET: () =>
        new Response(SVG, {
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        }),
    },
  },
});
