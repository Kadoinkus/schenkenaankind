import { useEffect, useState } from "react";
import { appCopy } from "../content/copy.js";
import { formatDate } from "../lib/formatters.js";
import LibraryShowcase from "../components/ui/LibraryShowcase.jsx";
import HomePage from "./HomePage.jsx";
import CalculatorWizard from "../features/calculator/CalculatorWizard.jsx";
import { useTransferCalculator } from "../features/calculator/useTransferCalculator.js";

function getRoute() {
  if (window.location.hash === "#bibliotheek") {
    return "library";
  }

  if (window.location.hash.startsWith("#berekening")) {
    return "calculator";
  }

  return "home";
}

function useHashRoute() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

export default function App() {
  const route = useHashRoute();
  const calculator = useTransferCalculator();

  useEffect(() => {
    if (route === "calculator") {
      document.title = "Berekening maken | Huisoverdrachtgids";
      return;
    }

    if (route === "library") {
      document.title = "Componentbibliotheek | Huisoverdrachtgids";
      return;
    }

    document.title =
      "Woning overdragen aan kinderen berekenen | Huisoverdrachtgids";
  }, [route]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <a className="brand-mark" href="#">
            <span className="brand-mark__block" aria-hidden="true" />
            <span>
              <strong>{appCopy.brand}</strong>
              <small>{appCopy.eyebrow}</small>
            </span>
          </a>
          <nav className="site-nav" aria-label="Hoofdnavigatie">
            <a href="#" className={route === "home" ? "is-active" : ""}>
              Home
            </a>
            <a
              href="#berekening"
              className={route === "calculator" ? "is-active" : ""}
            >
              Start berekening
            </a>
          </nav>
        </div>
      </header>

      <main className="site-main">
        {route === "library" ? <LibraryShowcase /> : null}
        {route === "home" ? <HomePage /> : null}
        {route === "calculator" ? <CalculatorWizard calculator={calculator} /> : null}
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <p>
            {appCopy.disclaimer} Laatst gecontroleerd op {formatDate(appCopy.reviewedOn)}.
          </p>
          <a href="#bibliotheek">Interne componentbibliotheek</a>
        </div>
      </footer>
    </div>
  );
}
