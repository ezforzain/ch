import { Link } from 'react-router-dom';

/** Reusable breadcrumb trail. `items`: [{ label, to? }] — the last item has no `to`
 * (current page, rendered as plain bolded text). Default colors use the public site's
 * Tailwind tokens (text-mut/text-ink/text-line); admin/seller call sites override
 * `linkClassName`/`currentClassName`/`separatorClassName` to switch to their `var(--a-*)`
 * tokens instead, since those aren't re-themed by the public tokens' fixed light values. */
export default function Breadcrumbs({
  items,
  className = '',
  linkClassName = 'text-mut transition-colors hover:text-ink',
  currentClassName = 'font-semibold text-ink',
  separatorClassName = 'text-line',
}) {
  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-1.5 text-[12px] font-medium ${className}`}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {item.to ? (
            <Link to={item.to} className={linkClassName}>
              {item.label}
            </Link>
          ) : (
            <span className={currentClassName}>{item.label}</span>
          )}
          {i < items.length - 1 && (
            <span className={separatorClassName} aria-hidden="true">
              /
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
