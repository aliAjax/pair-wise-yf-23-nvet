import { useState } from "react";
import { createRoot } from "react-dom/client";
import { CuesPage } from "./pages/CuesPage";
import { FixturesPage } from "./pages/FixturesPage";
import { PreviewPage } from "./pages/PreviewPage";
import { TimelinePage } from "./pages/TimelinePage";
import { routes } from "./router/routes";
import "./styles.css";

const pages: Record<string, () => JSX.Element> = {
  "/fixtures": FixturesPage,
  "/cues": CuesPage,
  "/timeline": TimelinePage,
  "/preview": PreviewPage
};

function App() {
  const fallback = routes[0]?.route ?? "/fixtures";
  const initial = pages[window.location.pathname] ? window.location.pathname : fallback;
  const [active, setActive] = useState<string>(initial);
  const Current = pages[active] ?? FixturesPage;
  const go = (route: string) => {
    setActive(route);
    window.history.pushState(null, "", route);
  };
  return (
    <div className="shell">
      <aside>
        <div className="brand">舞台灯光编排模拟器</div>
        <nav>
          {routes.map((route) => (
            <button
              key={route.route}
              className={active === route.route ? "active" : ""}
              onClick={() => go(route.route)}
            >
              {route.name}
            </button>
          ))}
        </nav>
      </aside>
      <Current />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
