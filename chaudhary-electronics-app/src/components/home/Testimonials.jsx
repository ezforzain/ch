import { useEffect, useRef, useState } from 'react';
import { imgFallback } from '../../lib/format';
import { testimonials } from '../../data/testimonials';
import Lightbox from '../ui/Lightbox';

const AUTO_ADVANCE_MS = 5000;
const SWIPE_THRESHOLD = 40;

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-[3px]" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          aria-hidden="true"
          viewBox="0 0 20 20"
          width="15"
          height="15"
          className={i < rating ? 'fill-acc' : 'fill-none stroke-current opacity-30'}
          strokeWidth={i < rating ? 0 : 1.4}
        >
          <path d="M10 1.5l2.59 5.25 5.79.84-4.19 4.09.99 5.77L10 14.77l-5.18 2.68.99-5.77L1.62 7.59l5.79-.84L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function QuoteMark({ dark }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 24"
      width="28"
      height="21"
      className={`flex-shrink-0 ${dark ? 'text-paper/15' : 'text-ink/10'}`}
      fill="currentColor"
    >
      <path d="M4 0C1.8 0 0 1.8 0 4v6c0 2.2 1.8 4 4 4h2c0 3.3-2.7 6-6 6v4c5.5 0 10-4.5 10-10V4c0-2.2-1.8-4-4-4H4zm18 0c-2.2 0-4 1.8-4 4v6c0 2.2 1.8 4 4 4h2c0 3.3-2.7 6-6 6v4c5.5 0 10-4.5 10-10V4c0-2.2-1.8-4-4-4h-2z" />
    </svg>
  );
}

export default function Testimonials() {
  const [openCase, setOpenCase] = useState(null);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const touchRef = useRef({ x: 0, active: false });
  const paused = hovered || manualPause;

  useEffect(() => {
    if (paused || prefersReducedMotion()) return undefined;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, [paused]);

  const goPrev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  const goNext = () => setIndex((i) => (i + 1) % testimonials.length);

  function onTouchStart(e) {
    touchRef.current = { x: e.touches[0].clientX, active: true };
  }
  function onTouchEnd(e) {
    if (!touchRef.current.active) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    touchRef.current.active = false;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) goNext();
      else goPrev();
    }
  }

  return (
    <section
      className="px-5 py-[clamp(48px,6vw,84px)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="relative mx-auto max-w-[540px] px-10 sm:px-0">
        <div
          className="overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          aria-roledescription="carousel"
          aria-label="Customer testimonials"
        >
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {testimonials.map((item, i) => {
              const open = () => setOpenCase(item.case);
              return (
                <div
                  key={item.id}
                  className="w-full shrink-0 px-1"
                  aria-hidden={i !== index}
                >
                  <div
                    role="button"
                    tabIndex={i === index ? 0 : -1}
                    onClick={open}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        open();
                      }
                    }}
                    aria-label={item.ariaLabel}
                    className={`group relative flex min-h-[276px] cursor-pointer flex-col rounded-[20px] border p-6 transition-[transform,box-shadow,border-color] duration-[400ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] sm:p-7 ${
                      item.dark
                        ? 'border-transparent bg-dark text-paper shadow-[0_22px_50px_-30px_rgba(23,21,15,0.65)] hover:border-acc/25 hover:shadow-[0_32px_64px_-28px_rgba(23,21,15,0.7)]'
                        : 'border-line bg-[#FBFAF7] shadow-[0_16px_40px_-26px_rgba(23,21,15,0.35)] hover:border-acc/30 hover:shadow-[0_26px_52px_-26px_rgba(23,21,15,0.4)]'
                    } hover:-translate-y-[4px]`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Stars rating={item.rating} />
                      <QuoteMark dark={item.dark} />
                    </div>

                    <div className="flex flex-1 flex-col justify-center gap-3 py-4">
                      <p className="m-0 font-sans text-[20px] leading-[1.5] font-medium tracking-[-0.02em] text-pretty">
                        {item.quote}
                      </p>
                      <span className="inline-flex w-fit items-center gap-[6px] text-[13.5px] font-semibold text-acc transition-transform duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:translate-x-[3px]">
                        See this install <span aria-hidden="true">→</span>
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-3 border-t pt-4 ${
                        item.dark ? 'border-[rgba(245,242,236,0.12)]' : 'border-line'
                      }`}
                    >
                      <div className="relative h-11 w-11 flex-shrink-0">
                        <img
                          loading="lazy"
                          decoding="async"
                          src={item.portrait}
                          onError={imgFallback(item.portraitFb)}
                          alt=""
                          className="h-11 w-11 rounded-full object-cover"
                        />
                        {item.verified && (
                          <span
                            className={`absolute -right-0.5 -bottom-0.5 grid h-[17px] w-[17px] place-items-center rounded-full border-2 bg-acc text-[#17150F] ${
                              item.dark ? 'border-dark' : 'border-[#FBFAF7]'
                            }`}
                          >
                            <svg aria-hidden="true" viewBox="0 0 20 20" width="9" height="9" className="fill-current">
                              <path d="M7.6 13.4L4.2 10l-1.4 1.4L7.6 16.2 17.2 6.6 15.8 5.2z" />
                            </svg>
                            <span className="sr-only">Verified customer</span>
                          </span>
                        )}
                      </div>
                      <span className="min-w-0">
                        <span className="block truncate text-[14.5px] font-semibold">{item.name}</span>
                        <span
                          className={`block truncate text-[12px] ${item.dark ? 'text-[rgba(245,242,236,0.55)]' : 'text-mut'}`}
                        >
                          {item.location}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous testimonial"
          className="absolute top-1/2 left-1 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-[#FBFAF7] text-base text-ink shadow-[0_10px_24px_-12px_rgba(23,21,15,0.35)] transition-[transform,background-color] duration-200 hover:scale-105 hover:bg-black/5 sm:left-[-42px] sm:h-10 sm:w-10"
        >
          ←
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next testimonial"
          className="absolute top-1/2 right-1 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-[#FBFAF7] text-base text-ink shadow-[0_10px_24px_-12px_rgba(23,21,15,0.35)] transition-[transform,background-color] duration-200 hover:scale-105 hover:bg-black/5 sm:right-[-42px] sm:h-10 sm:w-10"
        >
          →
        </button>

        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to testimonial ${i + 1}: ${t.name}`}
                aria-current={i === index ? 'true' : undefined}
                className={`h-2 rounded-full transition-[width,background-color] duration-300 ${
                  i === index ? 'w-6 bg-acc' : 'w-2 bg-ink/15 hover:bg-ink/35'
                }`}
              />
            ))}
          </div>
          {!prefersReducedMotion() && (
            <button
              type="button"
              onClick={() => setManualPause((p) => !p)}
              aria-label={manualPause ? 'Play testimonial autoplay' : 'Pause testimonial autoplay'}
              aria-pressed={manualPause}
              className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border border-line text-[11px] text-mut transition-colors hover:bg-black/5 hover:text-ink"
            >
              <span aria-hidden="true">{manualPause ? '▶' : '❚❚'}</span>
            </button>
          )}
        </div>

        <span className="sr-only" aria-live="polite">
          {`Showing testimonial ${index + 1} of ${testimonials.length}: ${testimonials[index].name}`}
        </span>
      </div>

      <Lightbox
        open={!!openCase}
        onClose={() => setOpenCase(null)}
        image={openCase?.img}
        caption={openCase?.caption}
      />
    </section>
  );
}
