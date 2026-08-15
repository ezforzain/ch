import { useEffect, useState } from 'react';

/**
 * Solar Planner's home-appliance counter: (−)/(+) buttons plus a directly editable numeric
 * field — typing "500" beats clicking + five hundred times. No upper bound on purpose: the
 * planner's calc engine (lib/plannerCalc.js) has no artificial appliance-count ceiling either,
 * only the real system-size ladder it snaps up to. Digit-stripping + live-commit mirrors the
 * pattern QuantityInput.jsx uses for the cart's buy box, kept as a separate component per that
 * file's own note — different consumer (no real max here), no shared blast radius.
 */
export default function Stepper({ value, onChange, min = 0 }) {
  const safeValue = Number.isFinite(value) ? value : min;
  const [text, setText] = useState(String(safeValue));

  // Mirrors external changes (the +/- buttons, a preset, another control) into the field.
  // A no-op while it already matches what was just typed, so normal typing isn't fought.
  useEffect(() => {
    setText(String(safeValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeValue]);

  function handleChange(e) {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
    setText(digitsOnly);
    // Recalculate live as each digit lands. An empty field (clearing the box to retype) is
    // left alone until blur instead of being forced back to a number mid-edit.
    if (digitsOnly !== '') onChange(Math.max(min, parseInt(digitsOnly, 10)));
  }

  function handleBlur() {
    if (text === '') {
      setText(String(min));
      onChange(min);
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-line bg-white/60 p-1">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(min, safeValue - 1))}
        className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-lg font-semibold text-ink transition hover:bg-black/5 disabled:opacity-30"
        disabled={safeValue <= min}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        aria-label="Quantity"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
        className="w-12 flex-shrink-0 border-none bg-transparent text-center text-[15px] font-semibold tabular-nums text-ink outline-none"
        data-tnum
      />
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(safeValue + 1)}
        className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-lg font-semibold text-ink transition hover:bg-black/5"
      >
        +
      </button>
    </div>
  );
}
