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
      className="px-5 py-[clamp(64px,8vw,110px)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="relative mx-auto max-w-[640px]">
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
                    className={`flex cursor-pointer flex-col gap-[16px] rounded-[24px] border p-7 transition-[transform,box-shadow] duration-[400ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                      item.dark
                        ? 'border-transparent bg-dark text-paper shadow-[0_26px_60px_-34px_rgba(23,21,15,0.6)] hover:shadow-[0_38px_74px_-34px_rgba(23,21,15,0.65)]'
                        : 'border-line bg-[#FBFAF7] shadow-[0_22px_52px_-34px_rgba(23,21,15,0.4)] hover:shadow-[0_34px_66px_-34px_rgba(23,21,15,0.45)]'
                    } hover:-translate-y-[6px]`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Stars rating={item.rating} />
                      {item.verified && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                            item.dark
                              ? 'border-[rgba(245,242,236,0.2)] text-[rgba(245,242,236,0.75)]'
                              : 'border-line text-mut'
                          }`}
                        >
                          <svg aria-hidden="true" viewBox="0 0 20 20" width="11" height="11" className="fill-current">
                            <path d="M7.6 13.4L4.2 10l-1.4 1.4L7.6 16.2 17.2 6.6 15.8 5.2z" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="m-0 font-sans text-[19px] leading-[1.45] font-medium tracking-[-0.02em] text-pretty">
                      {item.quote}
                    </p>
                    <span className="inline-flex items-center gap-[7px] text-[13.5px] font-semibold text-acc">
                      See this install <span aria-hidden="true">→</span>
                    </span>

                    <div className="mt-auto flex items-center gap-[11px]">
                      <img
                        loading="lazy"
                        decoding="async"
                        src={item.portrait}
                        onError={imgFallback(item.portraitFb)}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <span>
                        <span className="block text-[14px] font-semibold">{item.name}</span>
                        <span
                          className={`block text-[12.5px] ${item.dark ? 'text-[rgba(245,242,236,0.55)]' : 'text-mut'}`}
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
          className="absolute top-1/2 left-[-8px] grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-[#FBFAF7] text-base text-ink shadow-[0_10px_24px_-12px_rgba(23,21,15,0.35)] transition-colors hover:bg-black/5 sm:left-[-52px]"
        >
          ←
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next testimonial"
          className="absolute top-1/2 right-[-8px] grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-[#FBFAF7] text-base text-ink shadow-[0_10px_24px_-12px_rgba(23,21,15,0.35)] transition-colors hover:bg-black/5 sm:right-[-52px]"
        >
          →
        </button>

        <div className="mt-6 flex items-center justify-center gap-3">
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
