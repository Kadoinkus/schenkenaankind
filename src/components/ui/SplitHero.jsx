export default function SplitHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt = "",
  actions,
}) {
  return (
    <section className="split-hero">
      <div className="split-hero__content">
        {eyebrow ? <p className="split-hero__eyebrow">{eyebrow}</p> : null}
        <h1 className="split-hero__title">{title}</h1>
        {description ? <p className="split-hero__description">{description}</p> : null}
        {actions ? <div className="split-hero__actions">{actions}</div> : null}
      </div>
      <div className="split-hero__media" aria-hidden={imageAlt ? undefined : true}>
        <img src={image} alt={imageAlt} />
      </div>
    </section>
  );
}
