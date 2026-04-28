import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
	const body = await request.json();
	const { feedId, articleGuid } = body as {
		feedId?: string;
		articleGuid?: string;
	};

	if (!feedId || !articleGuid) {
		return NextResponse.json(
			{ error: "feedId and articleGuid are required" },
			{ status: 400 },
		);
	}

	const feed = await prisma.feed.findUnique({ where: { id: feedId } });
	if (!feed) {
		return NextResponse.json({ error: "Feed not found" }, { status: 404 });
	}

	const readArticle = await prisma.readArticle.upsert({
		where: {
			feedId_articleGuid: { feedId, articleGuid },
		},
		update: {},
		create: { feedId, articleGuid },
	});

	return NextResponse.json(readArticle, { status: 201 });
}
