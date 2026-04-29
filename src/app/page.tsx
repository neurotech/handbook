"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { ArticleView } from "@/components/article-view";
import { FeedList } from "@/components/feed-list";
import { Separator } from "@/components/ui/separator";
import type { Article } from "@/types";

interface SelectedArticle {
	feedId: string;
	guid: string;
	article: Article;
	feedName?: string;
}

export default function Home() {
	const [selected, setSelected] = useState<SelectedArticle | null>(null);
	const queryClient = useQueryClient();

	const markReadMutation = useMutation({
		mutationFn: async ({
			feedId,
			articleGuid,
		}: {
			feedId: string;
			articleGuid: string;
		}) => {
			const res = await fetch("/api/articles/read", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ feedId, articleGuid }),
			});
			if (!res.ok) throw new Error("Failed to mark as read");
			return res.json();
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["feed-articles", variables.feedId],
			});
		},
	});

	const handleSelectArticle = useCallback(
		(feedId: string, article: Article, feedName?: string) => {
			setSelected({ feedId, guid: article.guid, article, feedName });

			if (!article.isRead) {
				markReadMutation.mutate({ feedId, articleGuid: article.guid });
			}
		},
		[markReadMutation],
	);

	const feedListSelection = useMemo(
		() => (selected ? { feedId: selected.feedId, guid: selected.guid } : null),
		[selected],
	);

	return (
		<div className="flex min-h-0 flex-1 flex-col md:h-full md:flex-row">
			<aside
				className={
					selected !== null
						? "flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden border-border bg-muted/30 max-md:hidden md:w-80 md:border-r"
						: "flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden border-border border-b bg-muted/30 md:w-80 md:border-r md:border-b-0"
				}
			>
				<FeedList
					selectedArticle={feedListSelection}
					onSelectArticle={handleSelectArticle}
				/>
			</aside>
			<Separator orientation="vertical" className="hidden md:block" />
			<main
				className={
					selected === null
						? "hidden min-h-0 min-w-0 flex-1 bg-background md:flex"
						: "flex min-h-0 min-w-0 flex-1 flex-col bg-background"
				}
			>
				<ArticleView
					article={selected?.article ?? null}
					feedName={selected?.feedName}
					onNavigateBack={selected ? () => setSelected(null) : undefined}
				/>
			</main>
		</div>
	);
}
