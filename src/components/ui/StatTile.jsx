export default function StatTile({ label, value, tone = "default" }) {
  return (
    <article className={`stat-tile stat-tile--${tone}`}>
      <p className="stat-tile__label">{label}</p>
      <p className="stat-tile__value">{value}</p>
    </article>
  );
}
