"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Loader2, RefreshCw, Rss } from "lucide-react";
import { AddFeedDialog } from "@/components/add-feed-dialog";
import { FeedItem } from "@/components/feed-item";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Article, FeedWithMeta } from "@/types";

interface FeedListProps {
	selectedArticle: { feedId: string; guid: string } | null;
	onSelectArticle: (
		feedId: string,
		article: Article,
		feedName?: string,
	) => void;
}

export function FeedList({ selectedArticle, onSelectArticle }: FeedListProps) {
	const queryClient = useQueryClient();
	const { data: feeds, isLoading } = useQuery<FeedWithMeta[]>({
		queryKey: ["feeds"],
		queryFn: async () => {
			const res = await fetch("/api/feeds");
			if (!res.ok) throw new Error("Failed to fetch feeds");
			return res.json();
		},
	});

	const handleRefreshAll = () => {
		queryClient.invalidateQueries({ queryKey: ["feed-articles"] });
	};

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col">
			<div className="flex shrink-0 flex-col">
				<div className="flex items-center justify-between gap-3 p-3 sm:px-4">
					<div className="flex items-center gap-2">
						<BookOpen className="h-5 w-5 text-primary" />
						<h1 className="font-semibold text-lg">Handbook</h1>
					</div>
					<div className="flex items-center gap-1">
						<ThemeToggle />
						<Tooltip>
							<TooltipTrigger
								render={
									<Button
										size="icon"
										className="h-8 w-8"
										onClick={handleRefreshAll}
									/>
								}
							>
								<RefreshCw className="h-4 w-4" />
							</TooltipTrigger>
							<TooltipContent>Refresh all feeds</TooltipContent>
						</Tooltip>
						<AddFeedDialog />
					</div>
				</div>
				<Separator />
			</div>
			<ScrollArea className="min-h-0 flex-1">
				{isLoading && (
					<div className="flex min-h-48 items-center justify-center">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				)}
				{!isLoading && feeds?.length === 0 && (
					<div className="flex min-h-48 w-full flex-col items-center justify-center text-center">
						<div className="flex max-w-[min(100%,calc(100%-2rem))] flex-col items-center gap-3">
							<Rss className="h-10 w-10 text-muted-foreground/50" />
							<p className="text-muted-foreground text-sm">No feeds yet</p>
							<p className="text-muted-foreground/70 text-xs">
								Add an RSS feed to get started
							</p>
						</div>
					</div>
				)}
				{feeds?.map((feed) => (
					<FeedItem
						key={feed.id}
						feed={feed}
						selectedArticle={selectedArticle}
						onSelectArticle={onSelectArticle}
					/>
				))}
			</ScrollArea>
		</div>
	);
}
