import type { GeneratedFile } from "@/lib/groq";

// Turns a generated site into an installable PWA: home-screen icon, offline
// caching, standalone window. This is the honest free substitute for a native
// iOS/Android app — it doesn't go through app stores, but it installs and
// launches like an app on a phone.
export function addPwaSupport(files: GeneratedFile[], appName: string): GeneratedFile[] {
  const withoutOld = files.filter((f) => f.path !== "manifest.json" && f.path !== "sw.js");

  const manifest: GeneratedFile = {
    path: "manifest.json",
    content: JSON.stringify(
      {
        name: appName || "My App",
        short_name: (appName || "App").slice(0, 12),
        start_url: ".",
        display: "standalone",
        background_color: "#191A1D",
        theme_color: "#C1603D",
        icons: [],
      },
      null,
      2
    ),
  };

  const sw: GeneratedFile = {
    path: "sw.js",
    content: `const CACHE = "app-cache-v1";
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["./", "./index.html", "./styles.css", "./script.js"])));
});
self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});`,
  };

  const registerSnippet = `<script>if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js");}</script>`;

  const updated = withoutOld.map((f) => {
    if (f.path !== "index.html") return f;
    let html = f.content;
    if (!html.includes('rel="manifest"')) {
      html = html.replace("</head>", `  <link rel="manifest" href="manifest.json">\n  <meta name="theme-color" content="#C1603D">\n</head>`);
    }
    if (!html.includes("serviceWorker")) {
      html = html.replace("</body>", `  ${registerSnippet}\n</body>`);
    }
    return { ...f, content: html };
  });

  return [...updated, manifest, sw];
}
