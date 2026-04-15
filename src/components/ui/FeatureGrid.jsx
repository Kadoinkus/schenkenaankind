import Icon from "./Icon.jsx";

export default function FeatureGrid({ items }) {
  return (
    <div className="feature-grid">
      {items.map((item) => (
        <article className="feature-grid__item" key={item.title}>
          {item.icon ? (
            <div className="feature-grid__icon">
              <Icon name={item.icon} size={20} />
            </div>
          ) : null}
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}
