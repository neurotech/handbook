"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo } from "react";
import { ArticleView } from "@/components/article-view";
import { FeedList } from "@/components/feed-list";
import { Separator } from "@/components/ui/separator";
import type { Article, FeedArticlesResponse } from "@/types";

interface SelectedArticle {
	feedId: string;
	guid: string;
	article: Article;
	feedName?: string;
}

function buildArticleHref(
	pathname: string,
	feedId: string,
	guid: string,
): string {
	const q = new URLSearchParams({ feed: feedId, guid }).toString();
	return `${pathname}?${q}`;
}

function PageFallback() {
	return (
		<div className="flex min-h-[50vh] flex-1 items-center justify-center md:h-full">
			<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
		</div>
	);
}

function HomeContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const rawFeed = searchParams.get("feed");
	const rawGuid = searchParams.get("guid");

	const feedId = rawFeed?.trim() ?? "";
	const articleGuid = rawGuid?.trim() ?? "";

	const paramsComplete = feedId.length > 0 && articleGuid.length > 0;

	const searchMentionsArticle = rawFeed !== null || rawGuid !== null;

	useEffect(() => {
		if (!searchMentionsArticle) return;
		if (paramsComplete) return;
		router.replace(pathname);
	}, [paramsComplete, pathname, router, searchMentionsArticle]);

	const {
		data: articlesPayload,
		isPending: articlesPending,
		isFetching: articlesFetching,
		isError: articlesErrored,
	} = useQuery<FeedArticlesResponse>({
		queryKey: ["feed-articles", feedId],
		queryFn: async () => {
			const res = await fetch(`/api/feeds/${feedId}/articles`);
			if (!res.ok) throw new Error("Failed to fetch articles");
			return res.json();
		},
		enabled: paramsComplete,
	});

	const selection = useMemo((): SelectedArticle | null => {
		if (!paramsComplete || !articlesPayload) return null;
		const article = articlesPayload.articles.find(
			(a) => a.guid === articleGuid,
		);
		if (!article) return null;
		return {
			feedId,
			guid: articleGuid,
			article,
			feedName: articlesPayload.feed.name,
		};
	}, [articleGuid, articlesPayload, feedId, paramsComplete]);

	useEffect(() => {
		if (!paramsComplete || articlesPending || articlesFetching) return;
		if (!articlesPayload) return;
		if (!articlesPayload.articles.some((a) => a.guid === articleGuid)) {
			router.replace(pathname);
		}
	}, [
		articleGuid,
		articlesFetching,
		articlesPayload,
		articlesPending,
		paramsComplete,
		pathname,
		router,
	]);

	const queryClient = useQueryClient();

	const markReadMutation = useMutation({
		mutationFn: async ({
			feedId: markFeedId,
			articleGuid: markGuid,
		}: {
			feedId: string;
			articleGuid: string;
		}) => {
			const res = await fetch("/api/articles/read", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ feedId: markFeedId, articleGuid: markGuid }),
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

	useEffect(() => {
		if (!selection?.article || selection.article.isRead) return;
		markReadMutation.mutate({
			feedId: selection.feedId,
			articleGuid: selection.guid,
		});
	}, [selection, markReadMutation]);

	const handleSelectArticle = useCallback(
		(chosenFeedId: string, article: Article, _feedName?: string) => {
			router.push(buildArticleHref(pathname, chosenFeedId, article.guid), {
				scroll: false,
			});
		},
		[pathname, router],
	);

	const handleNavigateBack = useCallback(() => {
		router.back();
	}, [router]);

	const feedListSelection = useMemo(
		() =>
			paramsComplete
				? {
						feedId,
						guid: articleGuid,
					}
				: null,
		[articleGuid, feedId, paramsComplete],
	);

	const articleRouteActive = paramsComplete;

	const loadingArticleView =
		articleRouteActive &&
		!articlesErrored &&
		!selection &&
		(articlesPending || articlesFetching);

	return (
		<div className="flex min-h-0 flex-1 flex-col md:h-full md:flex-row">
			<aside
				className={
					articleRouteActive
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
					articleRouteActive
						? "flex min-h-0 min-w-0 flex-1 flex-col bg-background"
						: "hidden min-h-0 min-w-0 flex-1 bg-background md:flex"
				}
			>
				{loadingArticleView ? (
					<div className="flex flex-1 items-center justify-center">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : articlesErrored && articleRouteActive ? (
					<div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
						<h2 className="font-medium text-lg text-muted-foreground">
							Couldn&apos;t load this feed
						</h2>
						<p className="mt-2 text-muted-foreground/80 text-sm">
							Check the URL or try again later.
						</p>
					</div>
				) : (
					<ArticleView
						article={selection?.article ?? null}
						feedName={selection?.feedName}
						onNavigateBack={articleRouteActive ? handleNavigateBack : undefined}
					/>
				)}
			</main>
		</div>
	);
}

export default function Home() {
	return (
		<Suspense fallback={<PageFallback />}>
			<HomeContent />
		</Suspense>
	);
}
