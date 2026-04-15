export default function TrustBar({ items = [] }) {
  return (
    <section className="trust-bar" aria-label="Waarom deze tool prettig werkt">
      {items.map((item) => (
        <article key={item.title} className="trust-bar__item">
          <strong>{item.title}</strong>
          <p>{item.text}</p>
        </article>
      ))}
    </section>
  );
}
