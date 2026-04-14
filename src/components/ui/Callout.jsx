import Icon from "./Icon.jsx";

export default function Callout({ title, children, tone = "info", icon = "book" }) {
  return (
    <div className={`callout callout--${tone}`}>
      <div className="callout__icon">
        <Icon name={icon} size={18} />
      </div>
      <div className="callout__content">
        {title ? <h3 className="callout__title">{title}</h3> : null}
        <div className="callout__body">{children}</div>
      </div>
    </div>
  );
}
