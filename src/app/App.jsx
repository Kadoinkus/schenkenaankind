import { useEffect, useState } from "react";
import { appCopy } from "../content/copy.js";
import { formatDate } from "../lib/formatters.js";
import LibraryShowcase from "../components/ui/LibraryShowcase.jsx";
import HomePage from "./HomePage.jsx";
import CalculatorWizard from "../features/calculator/CalculatorWizard.jsx";
import { useTransferCalculator } from "../features/calculator/useTransferCalculator.js";
import { usePremiumAccess } from "../features/premium/usePremiumAccess.js";

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
  const premiumAccess = usePremiumAccess();

  useEffect(() => {
    if (route === "calculator") {
      document.title = "Berekening maken | schenkenaankind.nl";
      return;
    }

    if (route === "library") {
      document.title = "Componentbibliotheek | schenkenaankind.nl";
      return;
    }

    document.title = "Woning schenken aan kinderen berekenen | schenkenaankind.nl";
  }, [route]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <a className="brand-mark" href="#">
            <span className="brand-mark__text">
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
        {route === "calculator" ? (
          <CalculatorWizard calculator={calculator} premiumAccess={premiumAccess} />
        ) : null}
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__brand">
            <strong>{appCopy.brand}</strong>
            <p>{appCopy.footerNote}</p>
          </div>
          <p className="site-footer__meta">
            Laatst bijgewerkt op {formatDate(appCopy.reviewedOn)}.
          </p>
        </div>
      </footer>
    </div>
  );
}
