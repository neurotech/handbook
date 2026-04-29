"use client";

import { formatPubDateCompact } from "@/lib/dates";
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
	const date = formatPubDateCompact(article.pubDate);

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex min-h-11 w-full flex-col justify-center gap-1 border-border/50 border-b p-2 px-3 text-left transition-colors last:border-b-0 hover:cursor-pointer hover:bg-accent/50 sm:min-h-0 sm:justify-start sm:gap-1.5",
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
			<div className="flex items-center gap-2">
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
