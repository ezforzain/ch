import { useCallback, useEffect, useRef, useState } from 'react';

const HOLD_DELAY_MS = 400; // how long a press has to be held before it starts auto-repeating
const HOLD_REPEAT_MS = 90; // interval between auto-repeat steps once held

/**
 * Quantity stepper for the product detail page's buy box: (−)/(+) buttons plus a directly
 * editable numeric field (typing "500" beats clicking + five hundred times), press-and-hold
 * for fast repeat, and clamping to [min, max] (MOQ and stock respectively, as passed by the
 * caller). Deliberately separate from ui/Stepper.jsx (used by the unrelated Solar Planner
 * calculator) rather than extending that component with all of this — different needs,
 * different consumer, no shared blast radius this way.
 *
 * Controlled: `value`/`onChange` are the source of truth. `onInvalid(message)` is called
 * whenever a typed value has to be clamped, so the caller can surface *why* (e.g. "Only 12
 * left in stock") instead of the input just silently snapping to a different number.
 */
export default function QuantityInput({ value, onChange, min = 1, max = Infinity, disabled = false, onInvalid }) {
  const [text, setText] = useState(String(value));
  const valueRef = useRef(value);
  const holdDelayRef = useRef(null);
  const holdIntervalRef = useRef(null);
  const heldRef = useRef(false); // true once the hold-repeat has fired at least once this press

  useEffect(() => {
    valueRef.current = value;
    setText(String(value));
  }, [value]);

  const clamp = useCallback((n) => Math.min(max, Math.max(min, n)), [min, max]);

  // Returns whether the value actually moved — used by the hold-repeat interval to
  // self-terminate right when it hits the boundary, instead of keeping the interval
  // (and, absent this, its `onInvalid` message) firing every tick for as long as the
  // button stays held past that point.
  const tryStep = useCallback(
    (delta) => {
      const next = clamp(valueRef.current + delta);
      if (next === valueRef.current) return false;
      valueRef.current = next;
      onChange(next);
      return true;
    },
    [clamp, onChange],
  );

  const clearTimers = useCallback(() => {
    if (holdDelayRef.current) {
      clearTimeout(holdDelayRef.current);
      holdDelayRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const startPress = useCallback(
    (delta) => {
      if (disabled) return;
      heldRef.current = false;
      clearTimers();
      holdDelayRef.current = setTimeout(() => {
        holdIntervalRef.current = setInterval(() => {
          heldRef.current = true;
          if (!tryStep(delta)) clearTimers(); // hit the boundary — nothing left to repeat
        }, HOLD_REPEAT_MS);
      }, HOLD_DELAY_MS);
    },
    [clearTimers, disabled, tryStep],
  );

  const endPress = useCallback(() => clearTimers(), [clearTimers]);

  // A quick tap: mousedown/touchstart only *arms* the hold-repeat timer (above), it doesn't
  // step on its own — this single click is what actually steps, so a normal tap steps
  // exactly once. After a real hold (the repeat interval fired), the trailing click that
  // follows mouseup would otherwise add one unwanted extra step — swallow just that one.
  const handleClick = useCallback(
    (delta) => {
      if (heldRef.current) {
        heldRef.current = false;
        return;
      }
      if (!tryStep(delta)) {
        onInvalid?.(delta > 0 ? `Only ${max} available.` : min > 1 ? `Minimum order is ${min}.` : null);
      }
    },
    [max, min, onInvalid, tryStep],
  );

  function commitText(raw) {
    const digitsOnly = String(raw).replace(/[^0-9]/g, '');
    if (digitsOnly === '') {
      onChange(min);
      setText(String(min));
      return;
    }
    const parsed = parseInt(digitsOnly, 10);
    const clamped = clamp(parsed);
    if (clamped !== parsed) {
      onInvalid?.(
        parsed > max ? `Only ${max} available — quantity adjusted.` : `Minimum order is ${min} — quantity adjusted.`,
      );
    }
    valueRef.current = clamped;
    onChange(clamped);
    setText(String(clamped));
  }

  const atMin = value <= min;
  const atMax = value >= max;

  const btnClass =
    'grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-line bg-white text-xl font-semibold text-ink transition-colors select-none hover:bg-black/5 active:bg-black/10 disabled:pointer-events-none disabled:opacity-30 sm:h-11 sm:w-11';

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || atMin}
        className={btnClass}
        onMouseDown={() => startPress(-1)}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onTouchStart={() => startPress(-1)}
        onTouchEnd={endPress}
        onTouchCancel={endPress}
        onClick={() => handleClick(-1)}
      >
        −
      </button>

      <input
        type="text"
        inputMode="numeric"
        aria-label="Quantity"
        disabled={disabled}
        value={text}
        onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ''))}
        onBlur={(e) => commitText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
        className="h-12 w-[84px] flex-shrink-0 rounded-xl border border-line bg-white text-center text-[18px] font-bold tabular-nums text-ink outline-none focus:border-ink/40 focus:ring-4 focus:ring-ink/5 disabled:opacity-50 sm:h-11 sm:w-[72px] sm:text-[16px]"
      />

      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || atMax}
        className={btnClass}
        onMouseDown={() => startPress(1)}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onTouchStart={() => startPress(1)}
        onTouchEnd={endPress}
        onTouchCancel={endPress}
        onClick={() => handleClick(1)}
      >
        +
      </button>
    </div>
  );
}
