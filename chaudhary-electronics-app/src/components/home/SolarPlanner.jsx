import { useMemo, useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import Bi from '../ui/Bi';
import Stepper from '../ui/Stepper';
import { imgFallback, waLink } from '../../lib/format';
import {
  calcPlannerResult,
  formatPlannerPKR,
  PLANNER_DEFAULT_INPUTS,
  PLANNER_PRESET,
  PLANNER_LIMITS,
} from '../../lib/plannerCalc';

// Same business number QuoteForm.jsx / CartContext.jsx already use for their WhatsApp flows.
const WHATSAPP_NUMBER = '920000000000';

/** 68x40 pill switch, matches the source's inline-styled water pump / backup toggles. */
function ToggleSwitch({ checked, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`flex h-10 w-[68px] flex-shrink-0 cursor-pointer items-center rounded-full border-none p-1 transition-colors duration-300 ${
        checked ? 'justify-end bg-acc' : 'justify-start bg-[rgba(23,21,15,0.16)]'
      }`}
    >
      <span className="block h-8 w-8 rounded-full bg-[#FBFAF7] shadow-[0_3px_10px_-2px_rgba(23,21,15,0.45)]" />
    </button>
  );
}

function CounterRow({ labelEn, labelUr, value, onChange, min }) {
  return (
    <div className="flex items-center justify-between gap-3.5 border-b border-line py-4">
      <span className="text-[15.5px] font-semibold">
        <Bi en={labelEn} ur={labelUr} />
      </span>
      <Stepper value={value} onChange={onChange} min={min} />
    </div>
  );
}

function StatTile({ labelEn, labelUr, value, unit }) {
  return (
    <div className="rounded-2xl border border-[rgba(245,242,236,0.12)] bg-[rgba(245,242,236,0.08)] px-4 py-3.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.075em] text-[rgba(245,242,236,0.5)]">
        <Bi en={labelEn} ur={labelUr} />
      </div>
      <div className="mt-[5px] text-[26px] font-[680] tracking-[-0.034em]" data-tnum>
        {value}
        {unit && <span className="text-sm text-[rgba(245,242,236,0.6)]"> {unit}</span>}
      </div>
    </div>
  );
}

/**
 * The `#planner` Solar Planner section. Holds only UI state (the seven raw
 * inputs); all math lives in `lib/plannerCalc.js` and is recomputed on every
 * render via `calcPlannerResult`.
 *
 * @param {(summary: object) => void} [onCarryToQuote] - called when "Get this
 *   quoted — free" is clicked, with a summary object a sibling QuoteForm can
 *   render into its "carried from planner" notice.
 */
export default function SolarPlanner({ onCarryToQuote }) {
  const { lang, t } = useLang();
  const isUrdu = lang === 'ur';

  const [acs, setAcs] = useState(PLANNER_DEFAULT_INPUTS.acs);
  const [fans, setFans] = useState(PLANNER_DEFAULT_INPUTS.fans);
  const [lights, setLights] = useState(PLANNER_DEFAULT_INPUTS.lights);
  const [fridges, setFridges] = useState(PLANNER_DEFAULT_INPUTS.fridges);
  const [pump, setPump] = useState(PLANNER_DEFAULT_INPUTS.pump);
  const [backup, setBackup] = useState(PLANNER_DEFAULT_INPUTS.backup);
  const [hours, setHours] = useState(PLANNER_DEFAULT_INPUTS.hours);

  const result = useMemo(
    () => calcPlannerResult({ acs, fans, lights, fridges, pump, backup, hours }),
    [acs, fans, lights, fridges, pump, backup, hours],
  );

  const applyPreset = () => {
    setAcs(PLANNER_PRESET.acs);
    setFans(PLANNER_PRESET.fans);
    setLights(PLANNER_PRESET.lights);
    setFridges(PLANNER_PRESET.fridges);
    setPump(PLANNER_PRESET.pump);
    setBackup(PLANNER_PRESET.backup);
    setHours(PLANNER_PRESET.hours);
  };

  // source: toggleBackup() — turning backup ON bumps hours up to at least 4;
  // turning it OFF leaves the hours value untouched (just dimmed in the UI).
  const toggleBackup = () => {
    setBackup((prevBackup) => {
      if (!prevBackup) setHours((h) => Math.max(4, h));
      return !prevBackup;
    });
  };

  // source: setHours() — dragging the slider always re-enables backup
  const onHoursInput = (e) => {
    const v = parseInt(e.target.value, 10);
    setHours(v);
    if (!backup) setBackup(true);
  };

  const pkr = t('currency.pkr');
  const lakh = t('currency.lakh');
  const crore = t('currency.crore');
  const emptyToken = t('value.empty');
  const fmt = (n) => formatPlannerPKR(n, { pkr, lakh, crore, empty: emptyToken, isUrdu });

  const priceLowLabel = fmt(result.totalLow);
  const priceHighLabel = fmt(result.totalHigh);
  const priceRange = result.isEmpty ? emptyToken : `${priceLowLabel} – ${priceHighLabel}`;
  const monthlySavingLabel = fmt(result.monthlySaving);
  const paybackLabel =
    result.paybackYears > 0 ? `${result.paybackYears.toFixed(1)} ${t('unit.years')}` : emptyToken;
  const roofLabel =
    result.roofSqft > 0 ? `${result.roofSqft.toLocaleString('en-PK')} ${t('unit.sqft')}` : emptyToken;

  const packageTierKey =
    result.packageKey === 'hybridPlus'
      ? 'planner.pkgHybridPlus'
      : result.packageKey === 'hybridHome'
        ? 'planner.pkgHybridHome'
        : 'planner.pkgOnGrid';
  const emptyPackageLabel = isUrdu ? 'اپنی چیزیں شامل کریں' : 'Add an appliance to start';
  const packageName = result.isEmpty ? null : `${t(packageTierKey)} ${result.systemKw} ${t('unit.kw')}`;
  // plain-string form used for the "carried to quote" summary, where the empty-state
  // package name (rendered via <Bi> below) also needs to appear as ordinary text
  const packageNameText = result.isEmpty ? emptyPackageLabel : packageName;

  const batteryLabel = result.isEmpty
    ? emptyToken
    : result.batteryKwh
      ? `${result.batteryKwh} ${t('unit.kwh')}`
      : t('value.none');

  // Contextual advice — transcribed verbatim from the source's renderVals() ternary chain.
  // Note: this text (unlike the STRINGS-backed tokens above) was hardcoded inline in the
  // source rather than routed through its i18n dictionary, so it's reproduced the same way.
  let advice;
  if (result.isEmpty) {
    advice = {
      en: 'Use the counters above — tell us what runs in your home and the system sizes itself.',
      ur: 'اوپر اپنے اے سی، پنکھے اور لائٹس کی تعداد بتائیں۔',
    };
  } else if (acs >= 4) {
    advice = {
      en: `With ${acs} ACs we would stage this: inverter first, panels in phase two.`,
      ur: `${acs} اے سی کے ساتھ ہم کام دو مراحل میں کریں گے: پہلے انورٹر، پھر پینل۔`,
    };
  } else if (!result.batteryKwh) {
    advice = {
      en: 'No battery keeps cost per unit lowest — one can be added later without changing the inverter.',
      ur: 'بیٹری کے بغیر فی یونٹ لاگت سب سے کم رہتی ہے — بعد میں انورٹر بدلے بغیر بیٹری لگائی جا سکتی ہے۔',
    };
  } else if (hours >= 9) {
    advice = {
      en: `${hours} hours is a large bank. Most homes find 6 hours covers every real outage.`,
      ur: `${hours} گھنٹے کے لیے بیٹری بینک بڑا ہوجائے گا۔ عام طور پر ۶ گھنٹے کافی ہوتے ہیں۔`,
    };
  } else {
    advice = {
      en: 'Fits a standard 5–10 marla roof and qualifies for net metering.',
      ur: 'یہ سائز عام ۵ تا ۱۰ مرلہ کی چھت پر فٹ جاتا ہے اور نیٹ میٹرنگ کے لیے موزوں ہے۔',
    };
  }

  // source: carryToQuote() — builds the exact "From the planner: …" sentence shown in
  // the quote form's [data-plannercarry] box and appended to its WhatsApp message.
  // Sibling QuoteForm.jsx expects `plannerSummary` as this pre-formatted string (its
  // default `service` state already matches source's forced 'Solar system', so no
  // separate service hand-off is needed here).
  const handleCarryToQuote = () => {
    if (!onCarryToQuote) return;
    const batteryPart = result.batteryKwh
      ? `${result.batteryKwh} ${t('unit.kwh')} ${t('planner.battery')} · `
      : `${t('planner.noBattery')} · `;
    const summary = `${t('planner.fromPlanner')}: ${packageNameText} · ${batteryPart}${priceLowLabel} – ${priceHighLabel}`;
    onCarryToQuote(summary);
  };

  // Built fresh from the live `result`/inputs on every click (not memoized/cached), so
  // whatever was last typed is always what ends up in the message — no separate checkout
  // page, no stale snapshot. English throughout, matching QuoteForm.jsx/CartContext.jsx's
  // own WhatsApp messages, which stay English regardless of the site's language toggle.
  function buildBuyNowMessage() {
    const batteryLine = result.batteryKwh ? `${result.batteryKwh} kWh` : 'None';
    const backupLine = backup ? `${hours} hours` : 'Not selected';
    return (
      'Hello, I want to purchase this solar system.\n\n' +
      `Recommended System: ${packageName}\n` +
      `Solar Panels: ${result.panels}\n` +
      `Battery: ${batteryLine}\n` +
      `ACs: ${acs}\n` +
      `Fans: ${fans}\n` +
      `Lights: ${lights}\n` +
      `Refrigerators: ${fridges}\n` +
      `Backup Hours: ${backupLine}\n` +
      `Estimated Investment: ${priceLowLabel} – ${priceHighLabel}\n\n` +
      'Please guide me about the purchase and installation.'
    );
  }

  const handleBuyNow = () => {
    if (result.isEmpty) return;
    window.open(waLink(WHATSAPP_NUMBER, buildBuyNowMessage()), '_blank');
  };

  return (
    <section
      id="planner"
      aria-labelledby="planner-h"
      className="bg-gradient-to-b from-paper to-[#EFEBE3] px-5 py-[clamp(64px,8vw,110px)]"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 max-w-[640px]">
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-acc">
            <Bi en="Solar Planner" ur="سولر پلانر" />
          </span>
          <h2
            id="planner-h"
            className="mt-3 font-[680] text-[clamp(31px,4.1vw,56px)] leading-[1.02] tracking-[-0.035em]"
          >
            <Bi
              en={
                <>
                  Count your appliances.
                  <br />
                  We&apos;ll do the maths.
                </>
              }
              ur={
                <>
                  اپنی چیزیں گنیں،
                  <br />
                  حساب ہم کریں گے۔
                </>
              }
            />
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] items-start gap-4">
          {/* Inputs card */}
          <div className="rounded-[28px] border border-line bg-[#FBFAF7] p-[clamp(20px,2.6vw,30px)] shadow-[0_28px_66px_-40px_rgba(23,21,15,0.45)]">
            <div className="flex items-center justify-between gap-2.5 border-b border-line pb-3.5">
              <span className="text-base font-semibold">
                <Bi en="Your home" ur="آپ کا گھر" />
              </span>
              <button
                type="button"
                onClick={applyPreset}
                className="rounded-full border border-line bg-transparent px-3.5 py-2 text-[12.5px] font-semibold text-mut transition-colors hover:bg-black/5 hover:text-ink"
              >
                <Bi en="Typical 5-marla home" ur="عام ۵ مرلہ گھر" />
              </button>
            </div>

            <CounterRow
              labelEn="Air conditioners"
              labelUr="اے سی"
              value={acs}
              onChange={setAcs}
              min={PLANNER_LIMITS.acs.min}
            />
            <CounterRow
              labelEn="Fans"
              labelUr="پنکھے"
              value={fans}
              onChange={setFans}
              min={PLANNER_LIMITS.fans.min}
            />
            <CounterRow
              labelEn="Lights"
              labelUr="لائٹس"
              value={lights}
              onChange={setLights}
              min={PLANNER_LIMITS.lights.min}
            />
            <CounterRow
              labelEn="Refrigerators"
              labelUr="فریج"
              value={fridges}
              onChange={setFridges}
              min={PLANNER_LIMITS.fridges.min}
            />

            <div className="flex items-center justify-between gap-3.5 border-b border-line py-4">
              <span className="text-[15.5px] font-semibold">
                <Bi en="Water pump" ur="واٹر پمپ" />
              </span>
              <ToggleSwitch checked={pump} onChange={setPump} ariaLabel="water pump" />
            </div>

            <div className="flex items-center justify-between gap-3.5 border-b border-line py-4">
              <span className="text-[15.5px] font-semibold">
                <Bi en="Backup in load shedding" ur="لوڈ شیڈنگ میں بیک اپ" />
              </span>
              <ToggleSwitch checked={backup} onChange={toggleBackup} ariaLabel="backup" />
            </div>

            <div className="pt-[18px] transition-opacity duration-300" style={{ opacity: backup ? 1 : 0.38 }}>
              <div className="mb-2.5 flex items-baseline justify-between gap-2.5">
                <span className="text-[15.5px] font-semibold">
                  <Bi en="Backup hours" ur="بیک اپ گھنٹے" />
                </span>
                <span className="text-[19.5px] font-[650] text-acc" data-tnum>
                  {hours} {t('unit.hours')}
                </span>
              </div>
              <input
                type="range"
                min={PLANNER_LIMITS.hours.min}
                max={PLANNER_LIMITS.hours.max}
                step={1}
                value={hours}
                onChange={onHoursInput}
                aria-label="backup hours"
                className="h-[26px] w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Result card */}
          <div
            role="status"
            aria-live="polite"
            aria-label="Recommended system"
            className="sticky top-[92px] overflow-hidden rounded-[28px] bg-dark text-[#F5F2EC] shadow-[0_36px_84px_-40px_rgba(23,21,15,0.7)]"
          >
            <div className="relative p-[clamp(22px,2.6vw,30px)]">
              <img
                loading="lazy"
                decoding="async"
                src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=700&q=80"
                onError={imgFallback('solar,panels,sky', 5)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-[0.28]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(15,14,11,0.55),rgba(15,14,11,0.95))]" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.075em] text-acc">
                  <span className="h-1.5 w-1.5 rounded-full bg-acc shadow-[0_0_10px_var(--color-acc)]" />
                  <Bi en="Recommended" ur="تجویز" />
                </span>
                <div className="mt-3 text-[clamp(26px,3.2vw,36px)] font-semibold leading-[1.08] tracking-[-0.035em]">
                  {result.isEmpty ? <Bi en="Add an appliance to start" ur="اپنی چیزیں شامل کریں" /> : packageName}
                </div>

                <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-3">
                  <StatTile
                    labelEn="Size"
                    labelUr="سائز"
                    value={result.isEmpty ? emptyToken : result.systemKw}
                    unit={t('unit.kw')}
                  />
                  <StatTile labelEn="Battery" labelUr="بیٹری" value={batteryLabel} />
                  <StatTile
                    labelEn="Panels"
                    labelUr="پینلز"
                    value={result.isEmpty ? emptyToken : result.panels}
                  />
                  <StatTile
                    labelEn="Daily use"
                    labelUr="روزانہ استعمال"
                    value={result.dailyUnits > 0 ? result.dailyUnits.toFixed(1) : '0'}
                    unit={t('unit.units')}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[18px] border-t border-[rgba(245,242,236,0.1)] p-[clamp(22px,2.6vw,30px)]">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.075em] text-[rgba(245,242,236,0.5)]">
                  <Bi en="Estimated investment" ur="تخمینی لاگت" />
                </div>
                <div className="mt-[6px] text-[clamp(26px,3.4vw,38px)] font-semibold tracking-[-0.035em]" data-tnum>
                  {priceRange}
                </div>
              </div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.075em] text-[rgba(245,242,236,0.5)]">
                    <Bi en="Monthly saving" ur="ماہانہ بچت" />
                  </div>
                  <div className="mt-1 text-xl font-semibold text-acc" data-tnum>
                    {monthlySavingLabel}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.075em] text-[rgba(245,242,236,0.5)]">
                    <Bi en="Pays back in" ur="لاگت واپس" />
                  </div>
                  <div className="mt-1 text-xl font-semibold" data-tnum>
                    {paybackLabel}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.075em] text-[rgba(245,242,236,0.5)]">
                    <Bi en="Roof needed" ur="چھت" />
                  </div>
                  <div className="mt-1 text-xl font-semibold" data-tnum>
                    {roofLabel}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[rgba(226,163,71,0.22)] bg-[rgba(226,163,71,0.1)] px-4 py-3.5 text-[14.5px] leading-[1.6] text-[rgba(245,242,236,0.85)]">
                <Bi en={advice.en} ur={advice.ur} />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="#quote"
                  onClick={handleCarryToQuote}
                  style={{ opacity: result.isEmpty ? 0.45 : 1 }}
                  className="flex flex-1 items-center justify-center gap-2.5 rounded-full bg-acc px-[22px] py-[17px] text-[15.5px] font-bold text-[#17150F] shadow-[0_16px_40px_-16px_rgba(226,163,71,0.8)] transition-transform duration-300 hover:-translate-y-[3px]"
                >
                  <Bi en="Get this quoted — free" ur="مفت کوٹیشن لیں" />
                  <span className="text-[17px]">→</span>
                </a>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={result.isEmpty}
                  style={{ opacity: result.isEmpty ? 0.45 : 1 }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[rgba(245,242,236,0.26)] bg-[rgba(245,242,236,0.1)] px-[22px] py-[17px] text-[15.5px] font-semibold whitespace-nowrap text-[#F5F2EC] backdrop-blur-[12px] transition-[background,transform] duration-300 hover:-translate-y-[3px] hover:bg-[rgba(245,242,236,0.2)] disabled:pointer-events-none"
                >
                  <Bi en="Buy Now" ur="ابھی خریدیں" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
