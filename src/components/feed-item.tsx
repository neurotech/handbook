"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ChevronRight,
	Loader2,
	MoreHorizontal,
	Pencil,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { ArticleListItem } from "@/components/article-list-item";
import { EditFeedDialog } from "@/components/edit-feed-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Article, FeedArticlesResponse, FeedWithMeta } from "@/types";

interface FeedItemProps {
	feed: FeedWithMeta;
	selectedArticle: { feedId: string; guid: string } | null;
	onSelectArticle: (
		feedId: string,
		article: Article,
		feedName?: string,
	) => void;
}

export function FeedItem({
	feed,
	selectedArticle,
	onSelectArticle,
}: FeedItemProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery<FeedArticlesResponse>({
		queryKey: ["feed-articles", feed.id],
		queryFn: async () => {
			const res = await fetch(`/api/feeds/${feed.id}/articles`);
			if (!res.ok) throw new Error("Failed to fetch articles");
			return res.json();
		},
		enabled: isOpen,
		refetchInterval: 5 * 60 * 1000,
	});

	const deleteMutation = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/feeds/${feed.id}`, { method: "DELETE" });
			if (!res.ok) throw new Error("Failed to delete feed");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["feeds"] });
		},
	});

	const articles = data?.articles ?? [];
	const unreadCount = articles.filter((a) => !a.isRead).length;

	return (
		<>
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div className="group flex items-center">
					<CollapsibleTrigger
						render={
							<button
								type="button"
								className="flex flex-1 items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
							/>
						}
					>
						<ChevronRight
							className={cn(
								"h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
								isOpen && "rotate-90",
							)}
						/>
						<span className="flex-1 truncate font-medium text-sm">
							{feed.name}
						</span>
						{isOpen && isLoading && (
							<Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
						)}
						{unreadCount > 0 && (
							<Badge
								variant="secondary"
								className="h-5 min-w-5 justify-center px-1.5 py-0 text-xs"
							>
								{unreadCount}
							</Badge>
						)}
					</CollapsibleTrigger>
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									variant="ghost"
									size="icon"
									className="mr-1 h-9 w-9 touch-manipulation opacity-100 md:h-8 md:w-8 md:opacity-0 md:transition-opacity md:group-hover:opacity-100"
								/>
							}
						>
							<MoreHorizontal className="h-4 w-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setEditOpen(true)}>
								<Pencil className="mr-2 h-4 w-4" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								variant="destructive"
								onClick={() => deleteMutation.mutate()}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<CollapsibleContent>
					{isLoading && (
						<div className="px-3 py-4 text-center text-muted-foreground text-sm">
							Loading articles...
						</div>
					)}
					{!isLoading && articles.length === 0 && (
						<div className="px-3 py-4 text-center text-muted-foreground text-sm">
							No articles found
						</div>
					)}
					{articles.map((article) => (
						<ArticleListItem
							key={article.guid}
							article={article}
							isSelected={
								selectedArticle?.feedId === feed.id &&
								selectedArticle?.guid === article.guid
							}
							onClick={() => onSelectArticle(feed.id, article, feed.name)}
						/>
					))}
				</CollapsibleContent>
			</Collapsible>

			<EditFeedDialog feed={feed} open={editOpen} onOpenChange={setEditOpen} />
		</>
	);
}
