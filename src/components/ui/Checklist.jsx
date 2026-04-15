import Icon from "./Icon.jsx";

export default function Checklist({ items }) {
  return (
    <div className="checklist" role="list">
      {items.map((item) => (
        <div className="checklist__item" key={item} role="listitem">
          <Icon name="check" size={18} />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
