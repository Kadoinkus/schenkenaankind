export default function HighlightStrip({ items }) {
  return (
    <section className="highlight-strip" aria-label="Snel overzicht">
      {items.map((item) => (
        <article className="highlight-strip__item" key={item.title}>
          <strong>{item.title}</strong>
          <p>{item.text}</p>
        </article>
      ))}
    </section>
  );
}
