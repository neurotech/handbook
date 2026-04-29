"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { type ReactNode, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
						refetchOnWindowFocus: false,
					},
				},
			}),
	);

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			themes={["light", "dark", "paper"]}
		>
			<QueryClientProvider client={queryClient}>
				<TooltipProvider>
					<div className="flex h-dvh min-h-0 flex-col">{children}</div>
				</TooltipProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
}
