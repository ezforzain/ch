import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Standard shadcn/ui class-combining helper: clsx for conditional classes, tailwind-merge
 * to resolve conflicting Tailwind utilities (e.g. a caller's `px-8` overriding a default `px-4`). */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
