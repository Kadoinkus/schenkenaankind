const iconPaths = {
  calculator: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="2" />
      <path d="M8 7.5h8" />
      <path d="M8 11.5h2" />
      <path d="M12 11.5h2" />
      <path d="M8 15.5h2" />
      <path d="M12 15.5h2" />
    </>
  ),
  house: (
    <>
      <path d="m3 10.5 9-7 9 7" />
      <path d="M6.5 9.5V20.5H17.5V9.5" />
      <path d="M10 20.5v-6h4v6" />
    </>
  ),
  family: (
    <>
      <circle cx="8" cy="8" r="2.5" />
      <circle cx="16.5" cy="7.5" r="2" />
      <path d="M4.5 18c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
      <path d="M13.5 17c.2-1.9 1.7-3.5 3.7-3.5 2.1 0 3.8 1.7 3.8 3.8" />
    </>
  ),
  balance: (
    <>
      <path d="M12 4v16" />
      <path d="M5 7h14" />
      <path d="M8 7 4.5 13h7L8 7Z" />
      <path d="m16 7-3.5 6h7L16 7Z" />
      <path d="M8.5 20h7" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5c2.3 1.7 4.8 2.5 7 2.5v5.5c0 4.5-2.8 7.6-7 9-4.2-1.4-7-4.5-7-9V6c2.2 0 4.7-.8 7-2.5Z" />
      <path d="m8.5 12 2.2 2.2 4.8-4.8" />
    </>
  ),
  alert: (
    <>
      <path d="m12 3.5 9 16H3l9-16Z" />
      <path d="M12 9v4.5" />
      <path d="M12 17h0" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.2 2.3 2.3 4.7-4.7" />
    </>
  ),
  book: (
    <>
      <path d="M5.5 5.5h8a2 2 0 0 1 2 2v11h-8a2 2 0 0 0-2 2Z" />
      <path d="M18.5 5.5h-5a2 2 0 0 0-2 2v11h7a2 2 0 0 1 2 2v-13a2 2 0 0 0-2-2Z" />
    </>
  ),
  components: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  arrow: <path d="M5 12h13m-4.5-4.5L18 12l-4.5 4.5" />,
};

export default function Icon({ name, size = 20, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[name] || iconPaths.book}
    </svg>
  );
}
