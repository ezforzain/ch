export default function Chip({ active, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-4 py-2.5 text-[14px] font-semibold transition-colors ${
        active
          ? 'border-ink bg-ink text-paper'
          : 'border-line bg-white/60 text-mut hover:border-ink/30 hover:text-ink'
      } ${className}`}
    >
      {children}
    </button>
  );
}
