import type { Metadata } from "next";
import { Geist_Mono, Hanken_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
	variable: "--font-hanken",
	subsets: ["latin"],
	display: "swap",
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "RSS Reader",
	description: "A simple RSS feed reader",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${hankenGrotesk.className} ${hankenGrotesk.variable} ${geistMono.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<body className="h-full">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
