export default function PageSection({
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <section className={`page-section ${className}`.trim()}>
      {(eyebrow || title || subtitle) && (
        <header className="page-section__header">
          {eyebrow ? <p className="page-section__eyebrow">{eyebrow}</p> : null}
          {title ? <h2 className="page-section__title">{title}</h2> : null}
          {subtitle ? <p className="page-section__subtitle">{subtitle}</p> : null}
        </header>
      )}
      <div className="page-section__body">{children}</div>
    </section>
  );
}
