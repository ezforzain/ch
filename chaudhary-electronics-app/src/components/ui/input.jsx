import { cn } from '../../lib/utils';

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-[52px] w-full min-w-0 rounded-[14px] border border-line bg-[#F8F7F3] px-4 text-[15px] text-ink outline-none transition-[box-shadow,border-color] duration-250 placeholder:text-mut disabled:cursor-not-allowed disabled:opacity-50',
        'focus:border-ink focus:shadow-[0_0_0_4px_rgba(23,21,15,0.08)]',
        'dark:border-[rgba(245,242,236,0.14)] dark:bg-[rgba(245,242,236,0.06)] dark:text-paper dark:placeholder:text-[rgba(245,242,236,0.4)]',
        'dark:focus:border-acc dark:focus:shadow-[0_0_0_4px_rgba(226,163,71,0.16)]',
        'aria-invalid:border-[#C0392B] aria-invalid:focus:shadow-[0_0_0_4px_rgba(192,57,43,0.12)]',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
