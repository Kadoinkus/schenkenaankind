import Icon from "./Icon.jsx";

export default function HeroBanner({
  eyebrow,
  title,
  description,
  image,
  imageAlt = "",
  actions,
  signals = [],
  panelTitle,
  panelItems = [],
}) {
  return (
    <section className="hero-banner">
      <div className="hero-banner__copy">
        {eyebrow ? <p className="hero-banner__eyebrow">{eyebrow}</p> : null}
        <h1 className="hero-banner__title">{title}</h1>
        {description ? <p className="hero-banner__description">{description}</p> : null}
        {actions ? <div className="hero-banner__actions">{actions}</div> : null}
        {signals.length ? (
          <ul className="hero-banner__signals">
            {signals.map((signal) => (
              <li key={signal}>
                <Icon name="check" size={16} />
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="hero-banner__visual">
        <div className="hero-banner__image-frame" aria-hidden={imageAlt ? undefined : true}>
          <img src={image} alt={imageAlt} />
        </div>

        {panelItems.length ? (
          <div className="hero-banner__panel">
            {panelTitle ? <p className="hero-banner__panel-title">{panelTitle}</p> : null}
            <div className="hero-banner__panel-list">
              {panelItems.map((item) => (
                <article key={item.title} className="hero-banner__panel-item">
                  <Icon name={item.icon || "check"} size={18} />
                  <div>
                    <strong>{item.title}</strong>
                    {item.text ? <p>{item.text}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
