import { useState } from "react";
import Icon from "./Icon.jsx";

export default function TopicSwitcher({ topics = [] }) {
  const [activeId, setActiveId] = useState(topics[0]?.id ?? "");
  const activeTopic = topics.find((topic) => topic.id === activeId) ?? topics[0];

  if (!activeTopic) {
    return null;
  }

  return (
    <section className="topic-switcher" aria-label="Belangrijkste onderwerpen">
      <div className="topic-switcher__tabs" role="tablist" aria-label="Kies onderwerp">
        {topics.map((topic) => {
          const isActive = topic.id === activeTopic.id;

          return (
            <button
              key={topic.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`topic-switcher__tab ${isActive ? "is-active" : ""}`.trim()}
              onClick={() => setActiveId(topic.id)}
            >
              <Icon name={topic.icon || "book"} size={16} />
              <span>{topic.label}</span>
            </button>
          );
        })}
      </div>

      <div className="topic-switcher__panel" role="tabpanel">
        <p className="topic-switcher__eyebrow">{activeTopic.eyebrow}</p>
        <h3>{activeTopic.title}</h3>
        <p className="topic-switcher__text">{activeTopic.text}</p>
        <ul className="topic-switcher__list">
          {activeTopic.points.map((point) => (
            <li key={point}>
              <Icon name="check" size={16} />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
