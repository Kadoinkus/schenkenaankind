import Icon from "./Icon.jsx";

export default function StepList({ items }) {
  return (
    <div className="step-list">
      {items.map((item, index) => (
        <article className="step-list__item" key={item.title}>
          <div className="step-list__marker">
            <span className="step-list__number">{index + 1}</span>
            <Icon name={item.icon} size={18} />
          </div>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}
