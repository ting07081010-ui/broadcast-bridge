import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";

import appCss from "../styles.css?url";

// TODO(host): 品牌名寫法待定案；目前採規劃預設值，站內統一半形「E 人 I 碎念」（各平台上的名稱不動）。
const SITE_NAME = "E 人 I 碎念";

const applySecurityHeaders = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeaders({
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  });
  return null;
});

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  beforeLoad: async () => {
    if (typeof window === "undefined") {
      try { await applySecurityHeaders(); } catch {}
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_NAME },
      { name: "description", content: "一個有點宅、很愛講、但認真生活的 Podcast" },
      { property: "og:title", content: SITE_NAME },
      { property: "og:description", content: "一個有點宅、很愛講、但認真生活的 Podcast" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_NAME },
      { name: "twitter:description", content: "一個有點宅、很愛講、但認真生活的 Podcast" },
      { name: "theme-color", content: "#121214" },
      { name: "google-site-verification", content: "Nd33MaCJb1v-7srB1kINB7F_K8sR5FAANzZZni4hE3s" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "canonical", href: "https://emting.life/" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

const TRACKING_SCRIPT = `(function(){
  window.dataLayer = window.dataLayer || [];
  function track(name, payload){ try { window.dataLayer.push(Object.assign({event:name}, payload||{})); } catch(e){} }
  document.addEventListener('click', function(e){
    var el = e.target && (e.target.closest ? e.target.closest('[data-event]') : null);
    if(!el) return;
    var name = el.getAttribute('data-event');
    if(!name) return;
    var payload = {};
    for (var i=0; i<el.attributes.length; i++){
      var a = el.attributes[i];
      if (a.name.indexOf('data-') === 0 && a.name !== 'data-event'){
        payload[a.name.slice(5)] = a.value;
      }
    }
    if (el.tagName === 'A' && el.href) payload.href = el.href;
    track(name, payload);
  }, { passive: true });
})();`;

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <HeadContent />
      </head>
      <body>
        <a href="#main" className="enian-skip-link">
          跳到主要內容
        </a>
        {children}
        <script dangerouslySetInnerHTML={{ __html: TRACKING_SCRIPT }} />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
