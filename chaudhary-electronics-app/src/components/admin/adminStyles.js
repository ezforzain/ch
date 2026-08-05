// Shared Tailwind class-name constants transcribed from source's repeated
// inline style strings (cardStyle, primaryBtnStyle, ghostBtnStyle, etc. —
// built once in `renderVals()` and reused across the whole admin template).
// Centralizing them here keeps every component byte-for-byte consistent.

export const cardClass =
  'flex flex-col gap-2.5 rounded-[20px] border border-[var(--a-line)] bg-[var(--a-white)] p-5 shadow-[0_14px_32px_-22px_rgba(23,21,15,0.25)]';

export const primaryBtnClass =
  'h-10 shrink-0 cursor-pointer rounded-[10px] border-none bg-[var(--a-ink)] px-[18px] text-[13px] font-bold text-[var(--a-white)] disabled:cursor-not-allowed disabled:opacity-60';

export const ghostBtnClass =
  'h-10 shrink-0 cursor-pointer rounded-[10px] border border-[var(--a-line)] bg-[var(--a-white)] px-4 text-[13px] font-semibold text-[var(--a-ink)]';

// source's ghostBtnSmallStyle border is a fixed rgba(23,21,15,.2), not the
// theme-dependent --line var — kept exactly as-is (not a bug to "fix").
export const ghostBtnSmallClass =
  'h-8 shrink-0 cursor-pointer rounded-lg border border-[rgba(23,21,15,0.2)] bg-transparent px-3 text-xs font-semibold text-[var(--a-ink)]';

export const dangerBtnSmallClass =
  'h-8 shrink-0 cursor-pointer rounded-lg border-none bg-[var(--a-danger)] px-3 text-xs font-semibold text-white';

export const dangerBtnClass =
  'h-10 shrink-0 cursor-pointer rounded-[10px] border-none bg-[var(--a-danger)] px-[18px] text-[13px] font-bold text-white';

export const rowBtnClass =
  'grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-[7px] border border-[var(--a-line)] bg-[var(--a-white)] text-xs text-[var(--a-ink)]';

export const rowBtnDangerClass =
  'grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-[7px] border border-[var(--a-danger-soft)] bg-[var(--a-danger-soft)] text-xs text-[var(--a-danger)]';

export const pagerBtnClass =
  'h-[34px] cursor-pointer rounded-lg border border-[var(--a-line)] bg-[var(--a-white)] px-3.5 text-[12.5px] font-semibold text-[var(--a-ink)] disabled:cursor-not-allowed disabled:opacity-40';

export const richBtnClass =
  'grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[7px] border border-[var(--a-line)] bg-[var(--a-white)] text-xs text-[var(--a-ink)]';

export const iconBtnClass =
  'grid h-9 w-9 flex-shrink-0 cursor-pointer place-items-center rounded-[10px] border border-[var(--a-line)] bg-[var(--a-white)] text-[15px] text-[var(--a-ink)]';

export const inputClass =
  'h-10 rounded-[10px] border border-[var(--a-line)] bg-[var(--a-white)] px-3.5 text-[13.5px] text-[var(--a-ink)] outline-none';

export const activeToggleBtnClass =
  'h-[34px] cursor-pointer rounded-lg border-none bg-[var(--a-ink)] px-3 text-[12.5px] font-semibold text-[var(--a-white)]';

export const inactiveToggleBtnClass =
  'h-[34px] cursor-pointer rounded-lg border border-[var(--a-line)] bg-[var(--a-white)] px-3 text-[12.5px] font-semibold text-[var(--a-ink)]';
