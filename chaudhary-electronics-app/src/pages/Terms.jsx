import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Bi from '../components/ui/Bi';

/** Simple static Terms & Conditions page — boilerplate appropriate for a
 * Pakistani solar/electronics business whose checkout is a WhatsApp deep link
 * rather than an on-site payment flow. */
export default function Terms() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[1300] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-[14.5px] focus:font-semibold focus:text-paper focus:shadow-[0_12px_28px_-8px_rgba(23,21,15,0.55)]"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-paper pt-[110px] text-ink">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 pb-[clamp(56px,8vw,96px)]">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 text-[14.5px] font-semibold text-mut transition-colors hover:text-ink"
        >
          <span aria-hidden="true">←</span>
          <Bi en="Back to home" ur="ہوم پیج پر واپس جائیں" />
        </Link>

        <div className="flex flex-col gap-3">
          <span className="text-[11.5px] font-semibold tracking-[0.1em] text-acc uppercase">
            <Bi en="Legal" ur="قانونی" />
          </span>
          <Bi
            as="h1"
            en="Terms & Conditions"
            ur="شرائط و ضوابط"
            className="text-[clamp(32px,4.4vw,52px)] font-[680] tracking-[-0.035em]"
          />
          <span className="text-[14px] text-mut">
            <Bi en="Last updated: August 2026" ur="آخری تازہ کاری: اگست 2026" />
          </span>
        </div>

        <div className="flex max-w-[760px] flex-col gap-6 text-[15.5px] leading-[1.75] text-ink/85">
          <Bi
            as="p"
            en="These terms govern your use of the Chaudhary Electronics website and marketplace listings. By browsing this site or sending us an enquiry, you agree to the points below."
            ur="یہ شرائط چوہدری الیکٹرانکس کی ویب سائٹ اور مارکیٹ پلیس لسٹنگز کے استعمال پر لاگو ہوتی ہیں۔ اس ویب سائٹ کو براؤز کرنے یا ہمیں درخواست بھیجنے سے، آپ ذیل کی شرائط سے متفق ہوتے ہیں۔"
          />

          <section className="flex flex-col gap-2">
            <Bi as="h2" en="Quotations, not invoices" ur="کوٹیشن، انوائس نہیں" className="text-[19px] font-[650] tracking-[-0.02em] text-ink" />
            <Bi
              as="p"
              en="Prices, specifications and stock levels shown on this site are indicative and may change without notice. Nothing on this website constitutes a binding sale — every order is confirmed, priced and scheduled directly with our team over WhatsApp or in person before any work begins."
              ur="اس ویب سائٹ پر دکھائی گئی قیمتیں، تفصیلات اور اسٹاک کی سطح اشاریہ ہیں اور بغیر اطلاع کے تبدیل ہو سکتی ہیں۔ اس ویب سائٹ پر کچھ بھی حتمی فروخت نہیں ہے — ہر آرڈر کام شروع ہونے سے پہلے ہماری ٹیم کے ساتھ واٹس ایپ یا بذات خود براہ راست طے، قیمت اور شیڈول کیا جاتا ہے۔"
            />
          </section>

          <section className="flex flex-col gap-2">
            <Bi as="h2" en="No online payments" ur="کوئی آن لائن ادائیگی نہیں" className="text-[19px] font-[650] tracking-[-0.02em] text-ink" />
            <Bi
              as="p"
              en="We do not process card or bank payments through this website. Adding a product to the cart or sending a WhatsApp order simply starts a conversation with our sales team, who will confirm final pricing, delivery/installation charges and accepted payment methods with you directly."
              ur="ہم اس ویب سائٹ کے ذریعے کارڈ یا بینک ادائیگیاں پروسیس نہیں کرتے۔ کسی پروڈکٹ کو کارٹ میں شامل کرنا یا واٹس ایپ پر آرڈر بھیجنا صرف ہماری سیلز ٹیم کے ساتھ بات چیت شروع کرتا ہے، جو آپ سے براہ راست حتمی قیمت، ترسیل/تنصیب کے چارجز اور قابل قبول ادائیگی کے طریقے طے کرے گی۔"
            />
          </section>

          <section className="flex flex-col gap-2">
            <Bi as="h2" en="Warranty & installation" ur="وارنٹی اور تنصیب" className="text-[19px] font-[650] tracking-[-0.02em] text-ink" />
            <Bi
              as="p"
              en="Warranty periods shown against individual products are manufacturer or seller warranties and are subject to the terms provided at the time of sale. Installation timelines discussed during a site survey are estimates and can shift with weather, material availability or site conditions."
              ur="انفرادی پروڈکٹس کے ساتھ دکھائی گئی وارنٹی مدت مینوفیکچرر یا سیلر کی وارنٹی ہے اور فروخت کے وقت فراہم کردہ شرائط کے تابع ہے۔ سائٹ سروے کے دوران زیر بحث تنصیب کا وقت اندازہ ہے اور موسم، مواد کی دستیابی یا سائٹ کی صورتحال کے ساتھ تبدیل ہو سکتا ہے۔"
            />
          </section>

          <section className="flex flex-col gap-2">
            <Bi as="h2" en="Contact us" ur="ہم سے رابطہ کریں" className="text-[19px] font-[650] tracking-[-0.02em] text-ink" />
            <Bi
              as="p"
              en="Questions about these terms? Message us on WhatsApp or email info@chaudharyelectronics.pk and we will be glad to help."
              ur="ان شرائط کے بارے میں سوالات ہیں؟ ہمیں واٹس ایپ پر پیغام دیں یا info@chaudharyelectronics.pk پر ای میل کریں، ہمیں مدد کر کے خوشی ہوگی۔"
            />
          </section>
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}
