"use client";

import { BookMarked, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themeChoices = [
	{ value: "light", label: "Light", Icon: Sun },
	{ value: "dark", label: "Dark", Icon: Moon },
	{ value: "paper", label: "Paper", Icon: BookMarked },
	{ value: "system", label: "System", Icon: Laptop },
] as const;

function TriggerIcon({
	theme,
	resolvedTheme,
}: {
	theme?: string | undefined;
	resolvedTheme?: string | undefined;
}) {
	switch (theme) {
		case "paper":
			return <BookMarked className="h-4 w-4 shrink-0 text-primary" />;
		case "system":
			return <Laptop className="h-4 w-4 shrink-0" />;
		case "dark":
			return <Moon className="h-4 w-4 shrink-0" />;
		case "light":
			return <Sun className="h-4 w-4 shrink-0" />;
		default:
			return resolvedTheme === "dark" ? (
				<Moon className="h-4 w-4 shrink-0" />
			) : (
				<Sun className="h-4 w-4 shrink-0" />
			);
	}
}

export function ThemeToggle() {
	const { theme, resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						size="icon"
						type="button"
						variant="ghost"
						className="relative h-8 w-8"
						title="Appearance"
						aria-label="Appearance"
					/>
				}
			>
				{mounted ? (
					<TriggerIcon theme={theme} resolvedTheme={resolvedTheme} />
				) : (
					<Sun className="h-4 w-4 shrink-0" />
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-44">
				<DropdownMenuRadioGroup
					value={mounted ? theme : undefined}
					onValueChange={setTheme}
				>
					{themeChoices.map(({ value, label, Icon }) => (
						<DropdownMenuRadioItem key={value} value={value}>
							<Icon className="h-4 w-4 shrink-0" />
							{label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
