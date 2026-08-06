import { Link } from 'react-router-dom';
import Bi from '../components/ui/Bi';

/** Simple static Privacy Policy page — boilerplate appropriate for a Pakistani
 * solar/electronics business whose "checkout" is a WhatsApp deep link and whose
 * only data collection is the on-site quote form (name, phone, city). Navbar/Footer
 * now come from PublicLayout (see App.jsx), not this page. */
export default function Privacy() {
  return (
    <div className="min-h-screen bg-paper pt-[110px] text-ink">
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
            en="Privacy Policy"
            ur="پرائیویسی پالیسی"
            className="text-[clamp(32px,4.4vw,52px)] font-[680] tracking-[-0.035em]"
          />
          <span className="text-[14px] text-mut">
            <Bi en="Last updated: August 2026" ur="آخری تازہ کاری: اگست 2026" />
          </span>
        </div>

        <div className="flex max-w-[760px] flex-col gap-6 text-[15.5px] leading-[1.75] text-ink/85">
          <Bi
            as="p"
            en={'Chaudhary Electronics ("we", "us") respects your privacy. This page explains, in plain terms, what little information we collect through this website and how it is used.'}
            ur="چوہدری الیکٹرانکس آپ کی پرائیویسی کا احترام کرتا ہے۔ یہ صفحہ سادہ الفاظ میں بتاتا ہے کہ ہم اس ویب سائٹ کے ذریعے کیا معلومات جمع کرتے ہیں اور انہیں کیسے استعمال کرتے ہیں۔"
          />

          <section className="flex flex-col gap-2">
            <Bi as="h2" en="Information we collect" ur="ہم کیا معلومات جمع کرتے ہیں" className="text-[19px] font-[650] tracking-[-0.02em] text-ink" />
            <Bi
              as="p"
              en="When you submit our quote form, use the Solar Planner, or message us on WhatsApp, we receive the details you choose to share — typically your name, mobile number, city and a short description of what you need. We do not ask for or store payment details anywhere on this site, since orders are confirmed and paid for directly with our team over WhatsApp or in person."
              ur="جب آپ ہمارا کوٹیشن فارم جمع کرواتے ہیں، سولر پلانر استعمال کرتے ہیں، یا واٹس ایپ پر پیغام بھیجتے ہیں، تو ہمیں وہی معلومات ملتی ہیں جو آپ خود فراہم کرتے ہیں — عام طور پر آپ کا نام، موبائل نمبر، شہر اور آپ کی ضرورت کی مختصر تفصیل۔ ہم اس ویب سائٹ پر کہیں بھی ادائیگی کی تفصیلات طلب یا محفوظ نہیں کرتے، کیونکہ آرڈرز کی تصدیق اور ادائیگی براہ راست ہماری ٹیم کے ساتھ واٹس ایپ یا بذات خود کی جاتی ہے۔"
            />
          </section>

          <section className="flex flex-col gap-2">
            <Bi as="h2" en="How we use it" ur="ہم اسے کیسے استعمال کرتے ہیں" className="text-[19px] font-[650] tracking-[-0.02em] text-ink" />
            <Bi
              as="p"
              en="Information you submit is used only to respond to your enquiry — to call or WhatsApp you back, schedule a site survey, or prepare a quotation. We do not sell, rent or share your details with third parties for marketing purposes."
              ur="آپ کی جمع کردہ معلومات صرف آپ کی درخواست کا جواب دینے کے لیے استعمال ہوتی ہیں — آپ کو کال یا واٹس ایپ کرنے، سائٹ سروے کا وقت طے کرنے، یا کوٹیشن تیار کرنے کے لیے۔ ہم آپ کی تفصیلات مارکیٹنگ کے مقاصد کے لیے کسی تیسرے فریق کو فروخت، کرایہ پر یا شیئر نہیں کرتے۔"
            />
          </section>

          <section className="flex flex-col gap-2">
            <Bi as="h2" en="Local storage & cookies" ur="لوکل اسٹوریج اور کوکیز" className="text-[19px] font-[650] tracking-[-0.02em] text-ink" />
            <Bi
              as="p"
              en="This site stores a few small preferences in your browser's local storage — such as your language choice, saved products and cart — purely so the site works smoothly on your device. This data never leaves your browser and is not sent to our servers."
              ur="یہ ویب سائٹ آپ کے براؤزر کے لوکل اسٹوریج میں چند چھوٹی ترجیحات محفوظ کرتی ہے — جیسے آپ کی زبان کا انتخاب، محفوظ کردہ پروڈکٹس اور کارٹ — صرف اس لیے کہ ویب سائٹ آپ کے ڈیوائس پر بہتر طریقے سے کام کرے۔ یہ ڈیٹا کبھی بھی آپ کے براؤزر سے باہر نہیں جاتا اور ہمارے سرورز کو نہیں بھیجا جاتا۔"
            />
          </section>

          <section className="flex flex-col gap-2">
            <Bi as="h2" en="Contact us" ur="ہم سے رابطہ کریں" className="text-[19px] font-[650] tracking-[-0.02em] text-ink" />
            <Bi
              as="p"
              en="If you have any questions about this policy or would like your details removed from our records, message us on WhatsApp or email info@chaudharyelectronics.pk."
              ur="اگر آپ کو اس پالیسی کے بارے میں کوئی سوال ہے یا آپ اپنی تفصیلات ہمارے ریکارڈ سے ہٹوانا چاہتے ہیں، تو ہمیں واٹس ایپ پر پیغام دیں یا info@chaudharyelectronics.pk پر ای میل کریں۔"
            />
          </section>
        </div>
      </div>
    </div>
  );
}
