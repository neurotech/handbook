"use client";

import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft, ExternalLink, Rss } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Article } from "@/types";

interface ArticleViewProps {
	article: Article | null;
	feedName?: string;
	/** Shows a sticky back affordance below the notch on narrow viewports. */
	onNavigateBack?: () => void;
}

export function ArticleView({
	article,
	feedName,
	onNavigateBack,
}: ArticleViewProps) {
	if (!article) {
		return (
			<div className="flex h-full flex-col items-center justify-center px-4 text-center sm:px-8">
				<Rss className="mb-4 h-12 w-12 text-muted-foreground/20 sm:h-16 sm:w-16" />
				<h2 className="font-medium text-lg text-muted-foreground/60 sm:text-xl">
					Select an article to read
				</h2>
				<p className="mt-2 text-muted-foreground/40 text-sm">
					<span className="md:hidden">
						Tap an article in your feed list below
					</span>
					<span className="hidden md:inline">
						Choose an article from the feed list on the left
					</span>
				</p>
			</div>
		);
	}

	const sanitizedContent = DOMPurify.sanitize(article.content, {
		ADD_TAGS: ["iframe"],
		ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
	});

	const date = article.pubDate
		? new Date(article.pubDate).toLocaleDateString("en-US", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		: null;

	return (
		<div className="flex h-full min-h-0 flex-col">
			{onNavigateBack !== undefined && (
				<div className="flex shrink-0 items-center gap-3 border-border border-b bg-background/95 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-md supports-backdrop-filter:bg-background/80 md:hidden">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-11 w-11 shrink-0 touch-manipulation"
						onClick={onNavigateBack}
						aria-label="Back to feeds"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<p className="min-w-0 flex-1 truncate text-muted-foreground text-sm leading-tight">
						{feedName}
					</p>
				</div>
			)}
			<ScrollArea
				className={cn(
					"min-h-0 flex-1",
					onNavigateBack === undefined && "h-full",
				)}
			>
				<article className="mx-auto max-w-3xl px-4 py-6 sm:px-8 sm:py-8">
					<header className="mb-3">
						<h1 className="mb-3 font-bold text-xl leading-tight sm:text-2xl">
							{article.title}
						</h1>
						<div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm sm:gap-3">
							{feedName && <Badge variant="outline">{feedName}</Badge>}
							{article.author && <span>by {article.author}</span>}
							{date && <span>{date}</span>}
						</div>
						{article.link && (
							<a
								href={article.link}
								target="_blank"
								rel="noopener noreferrer"
								className="mt-3 inline-flex min-h-11 touch-manipulation items-center gap-1.5 text-primary text-sm hover:underline sm:min-h-0"
							>
								View original
								<ExternalLink className="h-3.5 w-3.5" />
							</a>
						)}
					</header>
					<Separator className="mb-3" />
					<div
						className="prose prose-neutral dark:prose-invert flex max-w-none flex-col gap-4 text-base sm:text-lg [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_iframe]:max-w-full [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_li]:leading-relaxed [&_p]:leading-relaxed [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4"
						dangerouslySetInnerHTML={{ __html: sanitizedContent }}
					/>
				</article>
			</ScrollArea>
		</div>
	);
}
