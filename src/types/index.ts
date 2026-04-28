export interface Article {
	guid: string;
	title: string;
	link: string;
	content: string;
	snippet: string;
	author: string;
	pubDate: string;
	isRead?: boolean;
}

export interface FeedWithMeta {
	id: string;
	name: string;
	url: string;
	createdAt: string;
	updatedAt: string;
}

export interface FeedArticlesResponse {
	feed: FeedWithMeta;
	articles: Article[];
}
