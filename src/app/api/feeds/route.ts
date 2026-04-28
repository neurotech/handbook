import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateFeedUrl } from "@/lib/rss";

export async function GET() {
	const feeds = await prisma.feed.findMany({
		orderBy: { createdAt: "desc" },
	});
	return NextResponse.json(feeds);
}

export async function POST(request: Request) {
	const body = await request.json();
	const { url, name } = body as { url?: string; name?: string };

	if (!url) {
		return NextResponse.json({ error: "URL is required" }, { status: 400 });
	}

	const existing = await prisma.feed.findUnique({ where: { url } });
	if (existing) {
		return NextResponse.json(
			{ error: "Feed with this URL already exists" },
			{ status: 409 },
		);
	}

	const { valid, title } = await validateFeedUrl(url);
	if (!valid) {
		return NextResponse.json(
			{ error: "Invalid feed URL (not a valid RSS or JSON feed)" },
			{ status: 400 },
		);
	}

	const feed = await prisma.feed.create({
		data: {
			url,
			name: name || title || url,
		},
	});

	return NextResponse.json(feed, { status: 201 });
}
