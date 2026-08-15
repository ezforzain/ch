// Pure calculation engine for the Solar Planner, transcribed 1:1 from the
// source `.dc.html`'s `Component.calc()` (plus the small bits of
// `renderVals()` that decide the package name and the `fmtPKR()` formatter
// it uses for the result card). Every constant below is load-bearing —
// do not "clean up" or approximate any of these numbers.
//
// No React, no DOM, no i18n: this module only does arithmetic so it can be
// unit-tested and reasoned about in isolation.

// Appliance wattage assumptions (W) — source: calc() -> const W
const APPLIANCE_WATTS = {
  ac: 1300,
  fan: 80,
  light: 15,
  fridge: 250,
};

// Discrete system-size ladder (kW) the planner snaps up to — source: const sizes
const SYSTEM_SIZE_LADDER_KW = [3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50];

const PEAK_SUN_HOURS = 4.6; // assumed kWh produced per kWp per day
const SIZE_HEADROOM_MULTIPLIER = 1.05; // 5% headroom applied before picking a ladder size
const BATTERY_ROUND_TRIP_EFFICIENCY = 0.85;
const BATTERY_STEP_KWH = 5; // battery bank is rounded to the nearest 5 kWh
const BATTERY_MIN_KWH = 5; // floor once backup is enabled at all
const BATTERY_PRICE_PER_KWH = 56000; // PKR/kWh — fixed, not a configurable prop in source
const DEFAULT_PRICE_PER_KW = 152000; // PKR/kW — source DC prop `pricePerKw` default
const DEFAULT_UNIT_RATE = 58; // PKR/unit — source DC prop `unitRate` default
const MONTHLY_DAYS = 30;
const SYSTEM_YIELD_DERATE = 0.82; // inverter/soiling/temperature derate applied to monthly units
const PANEL_WATT = 585; // W per panel — matches the catalogue's flagship 585 W module
// roof = round(panels * 26 / 10) * 10  →  ≈2.6 sq ft per panel, rounded to the nearest 10 sq ft
const ROOF_SQFT_PER_PANEL_X10 = 26;

const PRICE_BAND_LOW = 0.94; // "Estimated investment" low end = total * 0.94
const PRICE_BAND_HIGH = 1.08; // "Estimated investment" high end = total * 1.08

export const PLANNER_DEFAULT_INPUTS = {
  acs: 1,
  fans: 4,
  lights: 8,
  fridges: 1,
  pump: false,
  backup: true,
  hours: 4,
};

// "Typical 5-marla home" preset — source: applyPreset()
export const PLANNER_PRESET = {
  acs: 2,
  fans: 6,
  lights: 14,
  fridges: 1,
  pump: true,
  backup: true,
  hours: 6,
};

// Only `hours` keeps a max — it drives a physical slider (backup bank sizing), not a typed
// appliance count. Appliance counts are intentionally unbounded above; the "ceiling" a large
// count hits is the real system-size ladder below (SYSTEM_SIZE_LADDER_KW), not a UI limit.
export const PLANNER_LIMITS = {
  acs: { min: 0 },
  fans: { min: 0 },
  lights: { min: 0 },
  fridges: { min: 0 },
  hours: { min: 2, max: 12 },
};

function clampCount(v) {
  return Math.max(0, Math.floor(Number(v) || 0));
}

/**
 * Transcribed 1:1 from the source's `calc()`. Pure function: given the raw
 * planner inputs, returns every derived number the UI needs.
 *
 * @param {object} inputs
 * @param {number} inputs.acs
 * @param {number} inputs.fans
 * @param {number} inputs.lights
 * @param {number} inputs.fridges
 * @param {boolean} inputs.pump
 * @param {boolean} inputs.backup
 * @param {number} inputs.hours
 * @param {number} [inputs.unitRate] - PKR/unit, source prop `unitRate` (default 58)
 * @param {number} [inputs.pricePerKw] - PKR/kW, source prop `pricePerKw` (default 152000)
 */
export function calcPlannerResult({
  acs,
  fans,
  lights,
  fridges,
  pump,
  backup,
  hours,
  unitRate = DEFAULT_UNIT_RATE,
  pricePerKw = DEFAULT_PRICE_PER_KW,
} = {}) {
  const W = APPLIANCE_WATTS;
  const acsN = clampCount(acs);
  const fansN = clampCount(fans);
  const lightsN = clampCount(lights);
  const fridgesN = clampCount(fridges);

  // daily kWh use — source: const daily = ...
  const daily =
    (acsN * W.ac * 6) / 1000 +
    (fansN * W.fan * 10) / 1000 +
    (lightsN * W.light * 6) / 1000 +
    (fridgesN * W.fridge * 24 * 0.4) / 1000 +
    (pump ? 0.75 : 0);

  if (daily <= 0) {
    return {
      isEmpty: true,
      dailyUnits: 0,
      systemKw: 0,
      batteryKwh: 0,
      total: 0,
      totalLow: 0,
      totalHigh: 0,
      monthlyUnits: 0,
      monthlySaving: 0,
      paybackYears: 0,
      panels: 0,
      roofSqft: 0,
      packageKey: null,
    };
  }

  // snap up to the next ladder size, with 5% headroom; falls back to the largest size
  const systemKw =
    SYSTEM_SIZE_LADDER_KW.find((v) => v >= (daily / PEAK_SUN_HOURS) * SIZE_HEADROOM_MULTIPLIER) ||
    SYSTEM_SIZE_LADDER_KW[SYSTEM_SIZE_LADDER_KW.length - 1];

  const hoursN = Math.max(
    PLANNER_LIMITS.hours.min,
    Math.min(PLANNER_LIMITS.hours.max, Math.round(Number(hours) || 6)),
  );

  // "essential" load excludes the pump; ACs count once as a flat 1300 W if any are present
  const essentialKw =
    (fansN * W.fan + lightsN * W.light + fridgesN * W.fridge + (acsN > 0 ? W.ac : 0)) / 1000;

  const batteryKwh = backup
    ? Math.max(
        BATTERY_MIN_KWH,
        Math.round(((essentialKw * hoursN) / BATTERY_ROUND_TRIP_EFFICIENCY) / BATTERY_STEP_KWH) *
          BATTERY_STEP_KWH,
      )
    : 0;

  const total = systemKw * pricePerKw + batteryKwh * BATTERY_PRICE_PER_KWH;
  const monthlyUnits = Math.round(systemKw * PEAK_SUN_HOURS * MONTHLY_DAYS * SYSTEM_YIELD_DERATE);
  const monthlySaving = Math.round(monthlyUnits * unitRate);
  const panels = Math.ceil((systemKw * 1000) / PANEL_WATT);
  const roofSqft = Math.round((panels * ROOF_SQFT_PER_PANEL_X10) / 10) * 10;
  const paybackYears = monthlySaving > 0 ? total / (monthlySaving * 12) : 0;

  // package tier — source: renderVals() pkg ternary
  const packageKey = batteryKwh > 0 ? (systemKw >= 12 ? 'hybridPlus' : 'hybridHome') : 'onGrid';

  return {
    isEmpty: false,
    dailyUnits: daily,
    systemKw,
    batteryKwh,
    total,
    totalLow: total * PRICE_BAND_LOW,
    totalHigh: total * PRICE_BAND_HIGH,
    monthlyUnits,
    monthlySaving,
    paybackYears,
    panels,
    roofSqft,
    packageKey,
  };
}

/**
 * Abbreviated PKR formatter used only by the planner's result card — source:
 * `Component.fmtPKR()`. This is deliberately NOT the same function as
 * `lib/format.js`'s `fmtPKR`, which always prints the exact amount (that one
 * mirrors the marketplace's `fmtExact()` instead). The planner's version
 * collapses large totals into "N lakh" / "N crore" the way the source does.
 *
 * @param {number} n
 * @param {{ pkr: string, lakh: string, crore: string, empty: string, isUrdu: boolean }} tokens
 */
export function formatPlannerPKR(n, { pkr, lakh, crore, empty, isUrdu }) {
  if (!isFinite(n) || n <= 0) return empty;
  const money = (body) => (isUrdu ? `${body} ${pkr}` : `${pkr} ${body}`);
  if (n >= 1e7) return money(`${(n / 1e7).toFixed(2).replace(/\.?0+$/, '')} ${crore}`);
  if (n >= 1e5) return money(`${(n / 1e5).toFixed(1).replace(/\.0$/, '')} ${lakh}`);
  return money((Math.round(n / 1000) * 1000).toLocaleString('en-PK'));
}

// ---------------------------------------------------------------------------
// Sanity checks — transcribed from the source's `selfTest()`. Not run
// automatically (this module has no side effects on import); call
// `__plannerSelfTest()` from a dev console or a test file if you want to
// re-verify the formula after touching this file.
// ---------------------------------------------------------------------------
export function __plannerSelfTest() {
  const cases = [
    ['empty house', { acs: 0, fans: 0, lights: 0, fridges: 0, pump: false, backup: false, hours: 4 }, (c) => c.isEmpty && c.total === 0],
    ['5-marla home', { acs: 2, fans: 6, lights: 14, fridges: 1, pump: true, backup: true, hours: 6 }, (c) => c.systemKw >= 5 && c.systemKw <= 10 && c.batteryKwh > 0],
    ['no backup = no battery', { acs: 2, fans: 6, lights: 14, fridges: 1, pump: false, backup: false, hours: 6 }, (c) => c.batteryKwh === 0],
    ['monotonic in load', null, () => {
      const a = calcPlannerResult({ acs: 1, fans: 2, lights: 4, fridges: 1, pump: false, backup: false, hours: 4 }).systemKw;
      const b = calcPlannerResult({ acs: 6, fans: 2, lights: 4, fridges: 1, pump: false, backup: false, hours: 4 }).systemKw;
      return b > a;
    }],
    ['negatives clamp', { acs: -5, fans: -2, lights: 0, fridges: 0, pump: false, backup: false, hours: 4 }, (c) => c.isEmpty],
  ];
  const failed = [];
  cases.forEach(([name, input, check]) => {
    const c = input ? calcPlannerResult(input) : null;
    let ok = false;
    try {
      ok = check(c);
    } catch {
      ok = false;
    }
    if (!ok) failed.push(name);
  });
  if (failed.length) console.error('[Solar Planner] formula checks failed:', failed);
  return failed.length === 0;
}
