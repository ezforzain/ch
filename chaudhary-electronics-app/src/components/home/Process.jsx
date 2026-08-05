import { useLang } from '../../i18n/LangContext';
import { processSteps } from '../../data/process';
import Bi from '../ui/Bi';

export default function Process() {
  const { lang } = useLang();

  return (
    <section className="bg-dark px-5 py-[clamp(64px,8vw,110px)] text-paper">
      <div className="mx-auto max-w-[1200px]">
        <Bi
          as="h2"
          en="Five steps, no surprises"
          ur="پانچ مراحل، کوئی حیرانی نہیں"
          className={`m-0 mb-8 font-sans font-[680] tracking-[-0.035em] ${
            lang === 'ur' ? 'text-[clamp(30px,4vw,54px)] leading-[1.12]' : 'text-[clamp(31px,4.1vw,56px)] leading-[1.02]'
          }`}
        />

        <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
          {processSteps.map((step) => (
            <div
              key={step.n}
              className={`rounded-[20px] border p-[22px] ${
                step.accent
                  ? 'border-[rgba(226,163,71,0.3)] bg-[linear-gradient(150deg,rgba(226,163,71,0.22),rgba(226,163,71,0.06))]'
                  : 'border-[rgba(245,242,236,0.1)] bg-[rgba(245,242,236,0.05)]'
              }`}
            >
              <div className="font-sans text-[10.5px] tracking-[0.07em] text-acc">{step.n}</div>
              <div className="mt-[10px] font-sans text-[17.5px] font-[650]">{step.title}</div>
              <div
                className={`mt-[5px] text-[14.5px] leading-[1.6] ${
                  step.accent ? 'text-[rgba(245,242,236,0.78)]' : 'text-[rgba(245,242,236,0.62)]'
                }`}
              >
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
