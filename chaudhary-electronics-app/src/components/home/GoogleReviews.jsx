import { useLang } from '../../i18n/LangContext';
import { googleReviews } from '../../data/reviews';
import Bi from '../ui/Bi';

function Stars({ rating }) {
  return (
    <span className="flex items-center gap-[2px]" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'text-acc' : 'text-[rgba(23,21,15,0.18)]'}>
          ★
        </span>
      ))}
    </span>
  );
}

// Deterministic hash so the same name always generates the same avatar.
function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// Locally-generated identicon-style avatar, seeded from the reviewer's name —
// a unique colorful pattern, not a photo of any real person, no network call.
function AvatarIcon({ name }) {
  const seed = hashSeed(name || '');
  const hueA = seed % 360;
  const hueB = (hueA + 40 + (seed % 60)) % 360;
  const angle = seed % 360;
  const dotCount = 3 + (seed % 3);
  const gradId = `av-${seed}`;

  return (
    <span className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
      <svg aria-hidden="true" viewBox="0 0 40 40" width="40" height="40">
        <defs>
          <linearGradient id={gradId} gradientTransform={`rotate(${angle})`}>
            <stop offset="0%" stopColor={`hsl(${hueA} 70% 62%)`} />
            <stop offset="100%" stopColor={`hsl(${hueB} 70% 48%)`} />
          </linearGradient>
        </defs>
        <rect width="40" height="40" fill={`url(#${gradId})`} />
        {Array.from({ length: dotCount }, (_, i) => {
          const s = seed + i * 97;
          const cx = ((s * 13) % 30) + 5;
          const cy = ((s * 7) % 30) + 5;
          const r = 3 + ((s * 3) % 5);
          return <circle key={i} cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.22)" />;
        })}
      </svg>
    </span>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18A13.86 13.86 0 0 1 10.94 24c0-1.45.25-2.86.7-4.18v-5.7H4.34A21.93 21.93 0 0 0 2 24c0 3.55.85 6.9 2.34 9.88z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

/**
 * Google-style reviews section, mounted in Home.jsx — visually related to but
 * distinct from home/Testimonials.jsx (generated avatars instead of photo
 * portraits, a Google wordmark, and a compact star-rating card layout).
 */
export default function GoogleReviews() {
  const { lang } = useLang();

  return (
    <section aria-labelledby="reviews-h" className="bg-[#F8F7F3] px-5 py-[clamp(64px,8vw,110px)]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-acc">
              <GoogleMark />
              <Bi en="Google Reviews" ur="گوگل ریویوز" />
            </span>
            <h2
              id="reviews-h"
              className={`mt-3 font-[680] tracking-[-0.035em] ${
                lang === 'ur' ? 'text-[clamp(28px,3.8vw,46px)] leading-[1.12]' : 'text-[clamp(29px,3.6vw,48px)] leading-[1.05]'
              }`}
            >
              <Bi en="Rated by the people we've installed for" ur="جن کے لیے ہم نے تنصیب کی، انہی کی رائے" />
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-line bg-[#FBFAF7] px-4 py-2.5">
            <span className="text-[17px] font-bold text-ink" data-tnum>4.8</span>
            <Stars rating={5} />
            <span className="text-[13px] text-mut">
              <Bi en="320+ reviews" ur="320+ ریویوز" />
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[14px]">
          {googleReviews.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-[20px] border border-line bg-[#FBFAF7] p-6 shadow-[0_22px_52px_-34px_rgba(23,21,15,0.4)]"
            >
              <div className="flex items-center gap-3">
                <AvatarIcon name={r.name} />
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-ink">{r.name}</span>
                  <span className="block text-[12.5px] text-mut">{r.relativeTime}</span>
                </span>
              </div>
              <Stars rating={r.rating} />
              <p className="m-0 text-[14.5px] leading-[1.55] text-ink/85">{r.quote}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
