import Icon from "./Icon.jsx";

export default function TimelineSteps({
  id,
  eyebrow,
  title,
  description,
  steps = [],
  image,
  imageAlt = "",
  panelTitle,
  panelBody,
  panelPoints = [],
}) {
  return (
    <section className="timeline-showcase" id={id}>
      <div className="timeline-showcase__content">
        {eyebrow ? <p className="timeline-showcase__eyebrow">{eyebrow}</p> : null}
        <h2 className="timeline-showcase__title">{title}</h2>
        {description ? <p className="timeline-showcase__description">{description}</p> : null}

        <ol className="timeline-showcase__list">
          {steps.map((step, index) => (
            <li key={step.title} className="timeline-showcase__item">
              <div className="timeline-showcase__line" aria-hidden="true">
                <span className="timeline-showcase__number">{index + 1}</span>
              </div>
              <div className="timeline-showcase__item-body">
                <div className="timeline-showcase__item-heading">
                  <Icon name={step.icon || "check"} size={18} />
                  <h3>{step.title}</h3>
                </div>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="timeline-showcase__visual">
        <div className="timeline-showcase__image-frame" aria-hidden={imageAlt ? undefined : true}>
          <img src={image} alt={imageAlt} />
        </div>

        {(panelTitle || panelBody || panelPoints.length) && (
          <aside className="timeline-showcase__panel">
            {panelTitle ? <p className="timeline-showcase__panel-title">{panelTitle}</p> : null}
            {panelBody ? <p className="timeline-showcase__panel-body">{panelBody}</p> : null}
            {panelPoints.length ? (
              <ul className="timeline-showcase__panel-points">
                {panelPoints.map((point) => (
                  <li key={point}>
                    <Icon name="check" size={16} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </aside>
        )}
      </div>
    </section>
  );
}
