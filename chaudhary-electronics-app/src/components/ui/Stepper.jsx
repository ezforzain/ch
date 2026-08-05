export default function Stepper({ value, onChange, min = 0, max = 99 }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-line bg-white/60 p-1">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="grid h-9 w-9 place-items-center rounded-full text-lg font-semibold text-ink transition hover:bg-black/5 disabled:opacity-30"
        disabled={value <= min}
      >
        −
      </button>
      <span className="w-8 text-center text-[15px] font-semibold tabular-nums" data-tnum>
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="grid h-9 w-9 place-items-center rounded-full text-lg font-semibold text-ink transition hover:bg-black/5 disabled:opacity-30"
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}
