"use client";

import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import type { Article } from "@/types";

interface ArticleListItemProps {
	article: Article;
	isSelected: boolean;
	onClick: () => void;
}

export function ArticleListItem({
	article,
	isSelected,
	onClick,
}: ArticleListItemProps) {
	const parsed = article.pubDate ? new Date(article.pubDate) : null;
	const date = parsed && isValid(parsed) ? format(parsed, "MMMM d") : null;

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"w-full border-border/50 border-b px-3 py-2 text-left transition-colors last:border-b-0 hover:cursor-pointer hover:bg-accent/50",
				isSelected && "bg-indigo-500 text-indigo-950 hover:bg-indigo-500",
				!article.isRead && "font-medium",
			)}
		>
			<p
				className={cn(
					"line-clamp-2 text-sm leading-snug",
					article.isRead && "text-muted-foreground",
					article.isRead && isSelected && "text-indigo-100",
				)}
			>
				{article.title}
			</p>
			<div className="mt-1 flex items-center gap-2">
				{!article.isRead && (
					<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
				)}
				{date && (
					<span
						className={cn(
							"text-xs",
							article.isRead && "text-muted-foreground",
							article.isRead && isSelected && "text-indigo-300",
						)}
					>
						{date}
					</span>
				)}
			</div>
		</button>
	);
}
