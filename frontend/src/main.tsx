import { useEffect, useState, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { useIndexedDbStore } from "./hooks/useIndexedDbStore";
import { FixturesPage } from "./pages/FixturesPage";
import { CuesPage } from "./pages/CuesPage";
import { TimelinePage } from "./pages/TimelinePage";
import { PreviewPage } from "./pages/PreviewPage";
import "./styles.css";

const PAGE_COMPONENTS: Record<string, () => ReactElement> = {
  "/fixtures": FixturesPage,
  "/cues": CuesPage,
  "/timeline": TimelinePage,
  "/preview": PreviewPage
};

function currentRoute(): string {
  const hash = window.location.hash.replace(/^#/, "");
  return routes.some((route) => route.route === hash) ? hash : routes[0].route;
}

function App() {
  const { ready } = useIndexedDbStore();
  const [active, setActive] = useState<string>(currentRoute());

  useEffect(() => {
    const onHashChange = () => setActive(currentRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const current = routes.find((route) => route.route === active) ?? routes[0];
  const Page = PAGE_COMPONENTS[current.route] ?? FixturesPage;

  return (
    <div className="shell">
      <aside>
        <div className="brand">舞台灯光编排模拟器</div>
        <nav>
          {routes.map((route) => (
            <a key={route.route} href={`#${route.route}`} className={active === route.route ? "active" : ""}>
              {route.name}
            </a>
          ))}
        </nav>
        <p className="aside-note">应急换灯台在「灯具布置」页</p>
      </aside>
      <main className="page">
        <section className="page-head">
          <div>
            <p className="eyebrow">stage-light</p>
            <h1>{current.name}</h1>
          </div>
          <span className={ready ? "hydration ready" : "hydration loading"}>
            {ready ? "本地数据已加载" : "加载中…"}
          </span>
        </section>
        {ready ? <Page /> : <section className="panel">正在从 IndexedDB 读取演出数据…</section>}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
