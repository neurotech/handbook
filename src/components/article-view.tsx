"use client";

import DOMPurify from "isomorphic-dompurify";
import { ExternalLink, Rss } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Article } from "@/types";

interface ArticleViewProps {
	article: Article | null;
	feedName?: string;
}

export function ArticleView({ article, feedName }: ArticleViewProps) {
	if (!article) {
		return (
			<div className="flex h-full flex-col items-center justify-center px-8 text-center">
				<Rss className="mb-4 h-16 w-16 text-muted-foreground/20" />
				<h2 className="font-medium text-muted-foreground/60 text-xl">
					Select an article to read
				</h2>
				<p className="mt-2 text-muted-foreground/40 text-sm">
					Choose an article from the feed list on the left
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
		<ScrollArea className="h-full">
			<article className="mx-auto max-w-3xl px-8 py-8">
				<header className="mb-6">
					<h1 className="mb-3 font-bold text-2xl leading-tight">
						{article.title}
					</h1>
					<div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
						{feedName && <Badge variant="outline">{feedName}</Badge>}
						{article.author && <span>by {article.author}</span>}
						{date && <span>{date}</span>}
					</div>
					{article.link && (
						<a
							href={article.link}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-3 inline-flex items-center gap-1.5 text-primary text-sm hover:underline"
						>
							View original
							<ExternalLink className="h-3.5 w-3.5" />
						</a>
					)}
				</header>
				<Separator className="mb-6" />
				<div
					className="prose prose-neutral dark:prose-invert flex max-w-none flex-col gap-4 text-lg [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_img]:max-w-full [&_img]:rounded-lg [&_li]:leading-relaxed [&_p]:leading-relaxed [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4"
					dangerouslySetInnerHTML={{ __html: sanitizedContent }}
				/>
			</article>
		</ScrollArea>
	);
}
