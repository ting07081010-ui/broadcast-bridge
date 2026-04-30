import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

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
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ｅ人Ｉ碎念" },
      { name: "description", content: "一個有點宅、很愛講、但認真生活的 Podcast" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Ｅ人Ｉ碎念" },
      { property: "og:description", content: "一個有點宅、很愛講、但認真生活的 Podcast" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Ｅ人Ｉ碎念" },
      { name: "twitter:description", content: "一個有點宅、很愛講、但認真生活的 Podcast" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/cbaac245-6ad7-4344-a4d5-10c155ff9933" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/cbaac245-6ad7-4344-a4d5-10c155ff9933" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: "https://emting.life/" },
      { rel: "preconnect", href: "https://feeds.soundon.fm" },
      { rel: "preconnect", href: "https://open.spotify.com" },
      { rel: "preconnect", href: "https://podcasts.apple.com" },
      { rel: "preconnect", href: "https://www.youtube.com" },
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
        <a href="#main" className="enian-skip-link">跳到主要內容</a>
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
