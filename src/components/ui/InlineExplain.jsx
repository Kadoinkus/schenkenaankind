import { useEffect, useId, useRef, useState } from "react";
import Icon from "./Icon.jsx";

export default function InlineExplain({
  title = "Wat betekent dit?",
  children,
  align = "left",
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onPointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      className={`inline-explain inline-explain--${align} ${open ? "is-open" : ""}`.trim()}
      ref={wrapperRef}
    >
      <button
        type="button"
        className="inline-explain__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name="help" size={14} />
        <span>Toelichting</span>
      </button>

      {open ? (
        <div
          id={panelId}
          className="inline-explain__panel"
          role="dialog"
          aria-label={title}
        >
          <div className="inline-explain__panel-header">
            <strong>{title}</strong>
            <button
              type="button"
              className="inline-explain__close"
              aria-label="Sluiten"
              onClick={() => setOpen(false)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="inline-explain__body">{children}</div>
        </div>
      ) : null}
    </div>
  );
}
