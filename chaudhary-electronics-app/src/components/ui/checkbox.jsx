import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

function Checkbox({ className, ...props }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer h-5 w-5 flex-shrink-0 rounded-[6px] border border-line bg-[#F8F7F3] outline-none transition-[box-shadow,border-color,background] duration-200',
        'data-[state=checked]:border-acc data-[state=checked]:bg-acc',
        'focus-visible:ring-2 focus-visible:ring-acc focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0F0E0B]',
        'dark:border-[rgba(245,242,236,0.22)] dark:bg-[rgba(245,242,236,0.06)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-ink">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
