import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Styling aligned with neurotech/command-circuit gradient + zinc “toolbar” buttons */
const buttonVariants = cva(
	[
		"group/button inline-flex shrink-0 cursor-pointer select-none flex-row items-center justify-center whitespace-nowrap rounded-sm border border-zinc-300 bg-clip-padding font-semibold text-xs outline-none transition-colors dark:border-zinc-900",
		"shadow-sm dark:shadow-[0_1px_--theme(--color-white/0.2)_inset,0_1px_1px_--theme(--color-zinc-950/0.1)]",
		"disabled:cursor-not-allowed dark:disabled:bg-zinc-900/70 dark:disabled:text-zinc-500 dark:disabled:shadow-[0_1px_--theme(--color-white/0.07)_inset,0_1px_1px_--theme(--color-zinc-950/0.5)]",
		"disabled:pointer-events-none",
		"focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-zinc-900",
		"aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25 dark:aria-invalid:border-destructive/80 dark:aria-invalid:ring-destructive/30",
		"active:not-aria-[haspopup]:translate-y-px [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	],
	{
		variants: {
			variant: {
				default:
					"border-border bg-primary text-primary-foreground hover:bg-primary/90 dark:border-zinc-900 dark:bg-indigo-600 dark:bg-linear-to-b dark:from-indigo-400/60 dark:to-indigo-800 dark:text-white disabled:dark:bg-linear-to-b disabled:dark:from-zinc-800 disabled:dark:to-zinc-600/40 disabled:dark:text-zinc-900 dark:hover:bg-linear-to-b dark:hover:from-indigo-400/90 dark:hover:to-indigo-800/80",
				outline:
					"border-border bg-background text-foreground shadow-none hover:bg-muted hover:text-foreground dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-100 dark:shadow-[0_1px_--theme(--color-white/0.2)_inset,0_1px_1px_--theme(--color-zinc-950/0.1)] dark:aria-expanded:bg-zinc-800 dark:hover:bg-zinc-800",
				secondary:
					"border-zinc-400 bg-muted text-muted-foreground shadow-none hover:bg-muted/80 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:shadow-[0_1px_--theme(--color-white/0.2)_inset,0_1px_1px_--theme(--color-zinc-950/0.1)] dark:hover:bg-zinc-700",
				ghost:
					"border-transparent shadow-none hover:bg-accent hover:text-accent-foreground dark:shadow-none dark:focus-visible:ring-offset-zinc-900 dark:hover:bg-zinc-800/60",
				destructive:
					"border-destructive/40 bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:border-red-950/60 dark:bg-linear-to-b dark:bg-red-600 dark:from-red-400/60 dark:to-red-800 dark:text-white dark:hover:bg-linear-to-b dark:hover:from-red-400/90 dark:hover:to-red-800/80",
				link: "border-transparent bg-transparent text-primary underline-offset-4 shadow-none hover:underline dark:text-indigo-300",
			},
			size: {
				default:
					"h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
				xs: "h-6 gap-1 in-data-[slot=button-group]:rounded-lg rounded-[min(var(--radius-md),10px)] px-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-7 gap-1 in-data-[slot=button-group]:rounded-lg rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
				lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
				icon: "size-8",
				"icon-xs":
					"size-6 in-data-[slot=button-group]:rounded-lg rounded-[min(var(--radius-md),10px)] [&_svg:not([class*='size-'])]:size-3",
				"icon-sm":
					"size-7 in-data-[slot=button-group]:rounded-lg rounded-[min(var(--radius-md),12px)]",
				"icon-lg": "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
	return (
		<ButtonPrimitive
			data-slot="button"
			className={cn(buttonVariants({ variant, size }), className)}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
