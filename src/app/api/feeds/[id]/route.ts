import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const body = await request.json();
	const { name, url } = body as { name?: string; url?: string };

	const existing = await prisma.feed.findUnique({ where: { id } });
	if (!existing) {
		return NextResponse.json({ error: "Feed not found" }, { status: 404 });
	}

	if (url && url !== existing.url) {
		const duplicate = await prisma.feed.findUnique({ where: { url } });
		if (duplicate) {
			return NextResponse.json(
				{ error: "Feed with this URL already exists" },
				{ status: 409 },
			);
		}
	}

	const feed = await prisma.feed.update({
		where: { id },
		data: {
			...(name !== undefined && { name }),
			...(url !== undefined && { url }),
		},
	});

	return NextResponse.json(feed);
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	const existing = await prisma.feed.findUnique({ where: { id } });
	if (!existing) {
		return NextResponse.json({ error: "Feed not found" }, { status: 404 });
	}

	await prisma.feed.delete({ where: { id } });

	return NextResponse.json({ success: true });
}
