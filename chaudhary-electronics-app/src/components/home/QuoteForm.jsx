import { useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { useToast } from '../../context/ToastContext';
import { imgFallback, waLink } from '../../lib/format';
import { api } from '../../lib/api';
import Bi from '../ui/Bi';
import Chip from '../ui/Chip';

// Verbatim from #quote in Chaudhary Electronics.dc.html (lines 529-591).
const WHATSAPP_NUMBER = '920000000000'; // props.whatsappNumber default (line 812)

const SERVICE_CHIPS = [
  { value: 'Solar system', label: 'Solar' },
  { value: 'Backup / UPS', label: 'Backup / UPS' },
  { value: 'Wiring', label: 'Wiring' },
  { value: 'CCTV', label: 'CCTV' },
  { value: 'Generator', label: 'Generator' },
  { value: 'Commercial project', label: 'Commercial' },
];

const CITIES = [
  'Lahore',
  'Rawalpindi / Islamabad',
  'Faisalabad',
  'Multan',
  'Karachi',
  'Peshawar',
  'Gujranwala',
  'Other city',
];

const DEFAULT_NOTE_EN = 'We never share your number.';
const DEFAULT_NOTE_UR = 'آپ کا نمبر شیئر نہیں ہوگا۔';

/** #quote — the "Three fields. One call back." contact section. `plannerSummary` is an
 * optional pre-formatted string handed down once the Solar Planner's "Get this quoted"
 * button (carryToQuote, line 1560) has run; when present it's shown in the box that mirrors
 * source's [data-plannercarry] (line 578), otherwise that box stays hidden exactly as the
 * source's `display:none` default. */
export default function QuoteForm({ plannerSummary }) {
  const { lang } = useLang();
  const showToast = useToast();

  const [service, setService] = useState('Solar system');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [note, setNote] = useState(null); // null => show the default bilingual note
  const [invalid, setInvalid] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function buildMessage() {
    const extra = plannerSummary ? '\n' + plannerSummary : '';
    return (
      'Assalam o Alaikum, I would like a quotation.\n' +
      'Name: ' + name + '\n' +
      'Phone: ' + phone + '\n' +
      'City: ' + city + '\n' +
      'Service: ' + service +
      extra
    );
  }

  function reportInvalid(msg) {
    setInvalid(true);
    setNote(msg);
    showToast(msg);
  }

  function withGuard(action) {
    if (submitting) return;
    if (!name.trim() || !phone.trim()) {
      reportInvalid('Please add your name and mobile number first.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      reportInvalid('That mobile number looks too short — please double-check it.');
      return;
    }
    setInvalid(false);
    setSubmitting(true);
    action();
    setTimeout(() => setSubmitting(false), 1200);
  }

  // Fire-and-forget: every quote request also becomes a real Lead in the backend/admin
  // panel, but this never blocks or fails the WhatsApp/call flow above, which stays the
  // primary, always-functional path even if the API is unreachable.
  function submitLead() {
    api
      .post('/leads', {
        name,
        phone,
        city,
        service,
        message: plannerSummary || '',
        source: plannerSummary ? 'planner' : 'website',
      })
      .catch((err) => console.error('Lead capture failed (WhatsApp/call flow unaffected):', err));
  }

  function sendWhatsApp() {
    withGuard(() => {
      window.open(waLink(WHATSAPP_NUMBER, buildMessage()), '_blank');
      submitLead();
      const msg = 'Opening WhatsApp — we reply within a few hours.';
      setNote(msg);
      showToast(msg);
    });
  }

  function requestCall() {
    withGuard(() => {
      const callMsg =
        `Assalam o Alaikum, please call me back.\n` +
        'Name: ' + name + '\n' +
        'Phone: ' + phone + '\n' +
        'City: ' + city;
      window.open(waLink(WHATSAPP_NUMBER, callMsg), '_blank');
      submitLead();
      const msg = `Thanks ${name.split(' ')[0]} — an engineer will call ${phone} within one working day.`;
      setNote(msg);
      showToast(msg);
    });
  }

  return (
    <section id="quote" className="bg-[#F8F7F3] px-5 pt-[clamp(80px,10vw,140px)] pb-[clamp(90px,10vw,150px)]">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 items-stretch gap-[clamp(28px,4vw,56px)] max-[820px]:grid-cols-1">
        <div className="flex h-full flex-col gap-5">
          <Bi
            as="h2"
            en={
              <>
                Three fields.
                <br />
                One call back.
              </>
            }
            ur={
              <>
                تین خانے۔
                <br />
                ایک کال۔
              </>
            }
            className={`m-0 mb-1 font-sans font-extrabold tracking-[-0.035em] text-[#111111] ${
              lang === 'ur' ? 'text-[clamp(30px,4vw,54px)] leading-[1.2]' : 'text-[clamp(34px,4.4vw,58px)] leading-[1.08]'
            }`}
          />

          <div className="min-h-[260px] flex-1 overflow-hidden rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            <img
              loading="lazy"
              decoding="async"
              src="https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=1000&q=80"
              onError={imgFallback('engineer,solar,site')}
              alt="Our engineers on site"
              className="block h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-[14px] rounded-[20px] border border-[#E8E8E8] bg-white p-[22px_24px] shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
            <div className="font-sans text-[12px] font-semibold tracking-[0.08em] text-[#777777] uppercase">
              Or call directly
            </div>
            <a
              href="tel:+920000000000"
              className="flex items-center gap-[10px] font-sans text-[26px] font-extrabold tracking-[-0.02em] text-[#111111] no-underline"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              +92 300 000 0000
            </a>
            <div className="flex items-center gap-[10px] text-[14px] text-[#777777]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Mon–Sat, 9am–8pm · Lahore, Rawalpindi, Faisalabad
            </div>
          </div>
        </div>

        <div className="flex h-full flex-col gap-[22px] rounded-[24px] border border-[#E8E8E8] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-shadow duration-250 hover:shadow-[0_16px_50px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-3">
            <Bi
              en="What do you need?"
              ur="آپ کو کیا درکار ہے؟"
              className="text-[14px] font-medium text-[#222222]"
            />
            <div className="flex flex-wrap gap-[9px]">
              {SERVICE_CHIPS.map((chip) => (
                <Chip key={chip.value} active={service === chip.value} onClick={() => setService(chip.value)}>
                  {chip.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2 text-[14px] font-medium text-[#222222]">
              <Bi en="Your name" ur="آپ کا نام" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ahmed Chaudhary"
                required
                aria-required="true"
                aria-invalid={invalid && !name.trim()}
                aria-describedby="quote-note"
                className={`h-[52px] rounded-[14px] border bg-[#F8F7F3] px-4 text-[15px] font-normal outline-none transition-[box-shadow,border-color] duration-250 focus:border-[#111111] focus:shadow-[0_0_0_4px_rgba(17,17,17,0.08)] ${
                  invalid && !name.trim() ? 'border-[#C0392B]' : 'border-[#E8E8E8]'
                }`}
              />
            </label>
            <label className="flex flex-col gap-2 text-[14px] font-medium text-[#222222]">
              <Bi en="Mobile number" ur="موبائل نمبر" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                inputMode="tel"
                placeholder="0300 000 0000"
                required
                aria-required="true"
                aria-invalid={invalid && (!phone.trim() || phone.replace(/\D/g, '').length < 10)}
                aria-describedby="quote-note"
                className={`h-[52px] rounded-[14px] border bg-[#F8F7F3] px-4 text-[15px] font-normal outline-none transition-[box-shadow,border-color] duration-250 focus:border-[#111111] focus:shadow-[0_0_0_4px_rgba(17,17,17,0.08)] ${
                  invalid && (!phone.trim() || phone.replace(/\D/g, '').length < 10) ? 'border-[#C0392B]' : 'border-[#E8E8E8]'
                }`}
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-[14px] font-medium text-[#222222]">
            <Bi en="City" ur="شہر" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-[52px] cursor-pointer rounded-[14px] border border-[#E8E8E8] bg-[#F8F7F3] px-4 text-[15px] font-normal text-[#222222] outline-none"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          {plannerSummary && (
            <div className="flex items-center gap-[10px] rounded-[14px] border border-[rgba(226,163,71,0.28)] bg-acc-soft px-4 py-[14px] text-[13.5px] leading-[1.5] text-[#7A5C24]">
              {plannerSummary}
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3">
            <button
              type="button"
              onClick={sendWhatsApp}
              disabled={submitting}
              className="flex h-14 items-center justify-center gap-[10px] rounded-full border-none bg-[#111111] text-[15.5px] font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-[transform,box-shadow] duration-250 ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-[2px] hover:shadow-[0_14px_36px_rgba(0,0,0,0.28)] disabled:pointer-events-none disabled:opacity-60"
            >
              <span className="h-[9px] w-[9px] rounded-full bg-[#25D366] shadow-[0_0_10px_#25D366]" />
              <Bi en="Send on WhatsApp" ur="واٹس ایپ پر بھیجیں" />
            </button>
            <button
              type="button"
              onClick={requestCall}
              disabled={submitting}
              className="h-14 rounded-full border border-[#E8E8E8] bg-white text-[15px] font-semibold text-[#222222] transition-[background,border-color] duration-250 hover:border-[#111111] hover:bg-[#F8F7F3] disabled:pointer-events-none disabled:opacity-60"
            >
              <Bi en="Request a call back" ur="کال بیک کی درخواست" />
            </button>
            <div
              id="quote-note"
              role="status"
              aria-live="polite"
              className={`min-h-[18px] text-center text-[13px] ${
                note ? 'font-semibold text-ink' : 'text-[#777777]'
              }`}
            >
              {note ? note : <Bi en={DEFAULT_NOTE_EN} ur={DEFAULT_NOTE_UR} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
