import { useLang } from '../../i18n/LangContext';

/** Renders one of two bilingual copy variants, mirroring the source design's
 * paired data-lang="en"/data-lang="ur" spans. */
export default function Bi({ en, ur, className = '', as: Tag = 'span', ...rest }) {
  const { lang } = useLang();
  if (lang === 'ur') {
    return (
      <Tag className={`font-urdu ${className}`} {...rest}>
        {ur}
      </Tag>
    );
  }
  return (
    <Tag className={className} {...rest}>
      {en}
    </Tag>
  );
}
