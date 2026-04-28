"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
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
		(feedId: string, article: Article) => {
			setSelected({ feedId, guid: article.guid, article });

			if (!article.isRead) {
				markReadMutation.mutate({ feedId, articleGuid: article.guid });
			}
		},
		[markReadMutation],
	);

	return (
		<div className="flex h-full min-h-0">
			<aside className="flex h-full min-h-0 w-80 shrink-0 flex-col overflow-hidden border-border border-r bg-muted/30">
				<FeedList
					selectedArticle={
						selected ? { feedId: selected.feedId, guid: selected.guid } : null
					}
					onSelectArticle={handleSelectArticle}
				/>
			</aside>
			<Separator orientation="vertical" />
			<main className="min-h-0 min-w-0 flex-1 bg-background">
				<ArticleView
					article={selected?.article ?? null}
					feedName={selected?.feedName}
				/>
			</main>
		</div>
	);
}
