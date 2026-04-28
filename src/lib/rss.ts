import Parser from "rss-parser";
import type { Article } from "@/types";

const parser = new Parser();

const FEED_ACCEPT =
	"application/rss+xml, application/atom+xml, application/xml, application/json, text/xml, */*";

function looksLikeJson(text: string): boolean {
	const t = text.trim();
	return t.startsWith("{") || t.startsWith("[");
}

function isJsonContentType(ct: string): boolean {
	const base = ct.split(";")[0]?.trim().toLowerCase() ?? "";
	return (
		base === "application/json" ||
		base === "text/json" ||
		base === "application/feed+json"
	);
}

function inferFeedTitleFromUrl(feedUrl: string): string {
	try {
		const host = new URL(feedUrl).hostname.replace(/^www\./, "");
		return host || feedUrl;
	} catch {
		return feedUrl;
	}
}

function stripSnippet(text: string, maxLen: number): string {
	const t = text.replace(/\s+/g, " ").trim();
	return t.slice(0, maxLen);
}

type JsonRecord = Record<string, unknown>;

function asRecord(v: unknown): JsonRecord | null {
	return v !== null && typeof v === "object" && !Array.isArray(v)
		? (v as JsonRecord)
		: null;
}

function stringifyGuid(v: unknown): string {
	if (v === null || v === undefined) return "";
	const s = String(v).trim();
	return s || "";
}

/** JSON Feed: root object with an `items` array per jsonfeed.org. */
function articlesFromJsonFeed(root: JsonRecord): Article[] | null {
	const items = root.items;
	if (!Array.isArray(items)) return null;

	const feedTitleFallback = stringifyGuid(root.title) || "";

	return items.map((raw, index) => {
		const item = asRecord(raw) ?? {};
		const link =
			stringifyGuid(item.url) || stringifyGuid(item.external_url) || "";
		const title = stringifyGuid(item.title) || "(untitled)";
		const guid =
			stringifyGuid(item.id) ||
			stringifyGuid(item.url) ||
			`${feedTitleFallback}-${index}-${link}`;
		const contentHtml = stringifyGuid(item.content_html);
		const contentText = stringifyGuid(item.content_text);
		const summary = stringifyGuid(item.summary);
		const content = contentHtml || contentText || summary || "";
		const snippetSource =
			contentText || summary || stripSnippet(contentHtml, 500);
		const snippet = stripSnippet(snippetSource, 200);
		const authors = item.authors;
		let author = "";
		if (Array.isArray(authors)) {
			const first = asRecord(authors[0]);
			if (first) author = stringifyGuid(first.name);
		}
		const pubRaw = item.date_published ?? item.date_modified;
		const pubDate =
			pubRaw instanceof Date ? pubRaw.toISOString() : stringifyGuid(pubRaw);
		return {
			guid,
			title,
			link,
			content,
			snippet,
			author,
			pubDate,
		};
	});
}

/** JSON arrays of stories (e.g. lobste.rs hottest.json endpoints). */
function articlesFromJsonArray(arr: unknown[]): Article[] | null {
	const articles: Article[] = [];

	for (const raw of arr) {
		const o = asRecord(raw);
		if (!o) continue;

		const title = stringifyGuid(o.title);
		const link = stringifyGuid(o.url ?? o.link);
		if (!title && !link) continue;

		const guid =
			stringifyGuid(o.short_id) ||
			stringifyGuid(o.id) ||
			stringifyGuid(o.guid) ||
			link ||
			title;

		const descPlain = stringifyGuid(o.description_plain);
		const desc = stringifyGuid(o.description);
		const content = desc || descPlain || "";
		const snippet = stripSnippet(descPlain || desc || "", 200);

		const pubRaw = o.created_at ?? o.pubDate ?? o.published_at ?? o.date;
		const pubDate =
			pubRaw instanceof Date ? pubRaw.toISOString() : stringifyGuid(pubRaw);

		const author =
			stringifyGuid(o.submitter_user) ||
			stringifyGuid(o.author) ||
			stringifyGuid(o.by);

		articles.push({
			guid,
			title: title || stripSnippet(link, 80) || "Untitled",
			link,
			content,
			snippet,
			author,
			pubDate,
		});
	}

	if (arr.length > 0 && articles.length === 0) return null;
	return articles;
}

function tryParseJsonArticles(text: string): Article[] | null {
	let data: unknown;
	try {
		data = JSON.parse(text);
	} catch {
		return null;
	}

	if (Array.isArray(data)) {
		return articlesFromJsonArray(data);
	}

	const root = asRecord(data);
	if (!root) return null;

	if (Array.isArray(root.items)) {
		const fromFeed = articlesFromJsonFeed(root);
		return fromFeed;
	}

	return null;
}

async function fetchFeedPayload(
	feedUrl: string,
): Promise<{ text: string; contentType: string }> {
	const res = await fetch(feedUrl, {
		headers: { Accept: FEED_ACCEPT },
		cache: "no-store",
	});
	if (!res.ok) {
		throw new Error(`HTTP ${res.status}`);
	}
	const contentType = res.headers.get("content-type") ?? "";
	const text = await res.text();
	return { text, contentType };
}

export async function fetchFeedArticles(feedUrl: string): Promise<Article[]> {
	const { text, contentType } = await fetchFeedPayload(feedUrl);

	if (isJsonContentType(contentType) || looksLikeJson(text)) {
		const parsed = tryParseJsonArticles(text);
		if (parsed !== null) {
			return parsed;
		}
	}

	const feed = await parser.parseString(text);
	return feed.items.map((item) => ({
		guid: item.guid || item.link || item.title || "",
		title: item.title || "Untitled",
		link: item.link || "",
		content: item["content:encoded"] || item.content || item.summary || "",
		snippet:
			item.contentSnippet?.slice(0, 200) || item.summary?.slice(0, 200) || "",
		author: item.creator || item.author || "",
		pubDate: item.pubDate || item.isoDate || "",
	}));
}

function titleFromJsonPayload(
	text: string,
	feedUrl: string,
): string | undefined {
	let data: unknown;
	try {
		data = JSON.parse(text);
	} catch {
		return undefined;
	}

	if (Array.isArray(data)) {
		return inferFeedTitleFromUrl(feedUrl);
	}

	const root = asRecord(data);
	if (!root) return undefined;

	const t = stringifyGuid(root.title);
	if (t) return t;

	if (Array.isArray(root.items) && articlesFromJsonFeed(root) !== null) {
		return inferFeedTitleFromUrl(feedUrl);
	}

	return inferFeedTitleFromUrl(feedUrl);
}

export async function validateFeedUrl(
	url: string,
): Promise<{ valid: boolean; title?: string }> {
	try {
		const { text, contentType } = await fetchFeedPayload(url);

		if (isJsonContentType(contentType) || looksLikeJson(text)) {
			const articles = tryParseJsonArticles(text);
			if (articles !== null) {
				const titled = titleFromJsonPayload(text, url);
				return { valid: true, title: titled ?? inferFeedTitleFromUrl(url) };
			}
		}

		const feed = await parser.parseString(text);
		return { valid: true, title: feed.title };
	} catch {
		return { valid: false };
	}
}
