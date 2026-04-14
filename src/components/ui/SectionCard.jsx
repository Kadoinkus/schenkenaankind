export default function SectionCard({
  eyebrow,
  title,
  subtitle,
  tone = "default",
  actions,
  children,
}) {
  return (
    <section className={`section-card section-card--${tone}`}>
      {(eyebrow || title || subtitle || actions) && (
        <header className="section-card__header">
          <div>
            {eyebrow ? <p className="section-card__eyebrow">{eyebrow}</p> : null}
            {title ? <h2 className="section-card__title">{title}</h2> : null}
            {subtitle ? <p className="section-card__subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="section-card__actions">{actions}</div> : null}
        </header>
      )}
      <div className="section-card__body">{children}</div>
    </section>
  );
}
