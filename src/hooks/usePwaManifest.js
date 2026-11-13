import { useEffect } from "react";

const APPS = {
  contador: {
    manifest: "/manifest.json",
    title: "Lorcana Contador",
    appleTitle: "Contador",
    themeColor: "#0a0a14",
  },
  config: {
    manifest: "/manifest-config.json",
    title: "Lorcana Config",
    appleTitle: "Config",
    themeColor: "#0c1428",
  },
};

/** Troca manifest / título para o Android instalar Contador e Config como apps distintos. */
export function usePwaManifest(appKey) {
  useEffect(() => {
    const app = APPS[appKey] ?? APPS.contador;

    document.title = app.title;

    let link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    // Force browsers to re-read identity when switching routes
    if (link.getAttribute("href") !== app.manifest) {
      link.setAttribute("href", app.manifest);
    }

    let appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (!appleTitle) {
      appleTitle = document.createElement("meta");
      appleTitle.name = "apple-mobile-web-app-title";
      document.head.appendChild(appleTitle);
    }
    appleTitle.content = app.appleTitle;

    let theme = document.querySelector('meta[name="theme-color"]');
    if (theme) theme.content = app.themeColor;
  }, [appKey]);
}
