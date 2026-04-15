import Icon from "./Icon.jsx";

export default function EditorialSplit({
  eyebrow,
  title,
  description,
  body = [],
  points = [],
  image,
  imageAlt = "",
  reverse = false,
  actions,
  aside,
  className = "",
}) {
  const sectionClassName = [
    "editorial-split",
    reverse ? "editorial-split--reverse" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClassName}>
      <div className="editorial-split__media" aria-hidden={imageAlt ? undefined : true}>
        <img src={image} alt={imageAlt} />
      </div>

      <div className="editorial-split__content">
        {eyebrow ? <p className="editorial-split__eyebrow">{eyebrow}</p> : null}
        <h2 className="editorial-split__title">{title}</h2>
        {description ? <p className="editorial-split__description">{description}</p> : null}

        {body.length ? (
          <div className="editorial-split__body">
            {body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        {points.length ? (
          <div className="editorial-split__points">
            {points.map((point) => (
              <article key={point.title} className="editorial-split__point">
                <Icon name={point.icon || "check"} size={18} />
                <div>
                  <strong>{point.title}</strong>
                  <p>{point.text}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {actions ? <div className="editorial-split__actions">{actions}</div> : null}
        {aside ? <div className="editorial-split__aside">{aside}</div> : null}
      </div>
    </section>
  );
}
