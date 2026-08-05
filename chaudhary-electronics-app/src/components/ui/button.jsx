import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[transform,box-shadow,background,color,border-color] duration-250 outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-acc focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0F0E0B] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          'bg-acc text-ink shadow-[0_10px_30px_-10px_rgba(226,163,71,0.7)] hover:-translate-y-px hover:shadow-[0_14px_36px_-10px_rgba(226,163,71,0.85)]',
        outline:
          'border border-line bg-transparent text-ink hover:bg-black/5 dark:border-[rgba(245,242,236,0.16)] dark:text-paper dark:hover:bg-white/5',
        ghost: 'bg-transparent text-mut hover:bg-black/5 hover:text-ink dark:text-[rgba(245,242,236,0.6)] dark:hover:bg-white/5 dark:hover:text-paper',
        link: 'text-acc underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-[52px] px-6 text-[15px]',
        sm: 'h-9 px-4 text-[13.5px]',
        lg: 'h-14 px-8 text-[16px]',
        icon: 'h-10 w-10 flex-shrink-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
