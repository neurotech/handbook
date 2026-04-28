import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchFeedArticles } from "@/lib/rss";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	const feed = await prisma.feed.findUnique({ where: { id } });
	if (!feed) {
		return NextResponse.json({ error: "Feed not found" }, { status: 404 });
	}

	try {
		const articles = await fetchFeedArticles(feed.url);

		const readArticles = await prisma.readArticle.findMany({
			where: { feedId: id },
			select: { articleGuid: true },
		});
		const readGuids = new Set(readArticles.map((r) => r.articleGuid));

		const articlesWithReadStatus = articles.map((article) => ({
			...article,
			isRead: readGuids.has(article.guid),
		}));

		return NextResponse.json({
			feed: {
				id: feed.id,
				name: feed.name,
				url: feed.url,
				createdAt: feed.createdAt.toISOString(),
				updatedAt: feed.updatedAt.toISOString(),
			},
			articles: articlesWithReadStatus,
		});
	} catch (error) {
		console.error("Failed to fetch feed articles:", error);
		return NextResponse.json(
			{ error: "Failed to fetch feed articles" },
			{ status: 502 },
		);
	}
}
