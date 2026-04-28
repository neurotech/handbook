"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { FeedWithMeta } from "@/types";

interface EditFeedDialogProps {
	feed: FeedWithMeta;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditFeedDialog({
	feed,
	open,
	onOpenChange,
}: EditFeedDialogProps) {
	const [url, setUrl] = useState(feed.url);
	const [name, setName] = useState(feed.name);
	const [error, setError] = useState("");
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/feeds/${feed.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url, name }),
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to update feed");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["feeds"] });
			queryClient.invalidateQueries({
				queryKey: ["feed-articles", feed.id],
			});
			setError("");
			onOpenChange(false);
		},
		onError: (err: Error) => {
			setError(err.message);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Feed</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						mutation.mutate();
					}}
					className="space-y-4"
				>
					<div className="space-y-2">
						<label htmlFor="edit-feed-url" className="font-medium text-sm">
							Feed URL
						</label>
						<Input
							id="edit-feed-url"
							value={url}
							onChange={(e) => {
								setUrl(e.target.value);
								setError("");
							}}
							required
						/>
					</div>
					<div className="space-y-2">
						<label htmlFor="edit-feed-name" className="font-medium text-sm">
							Name
						</label>
						<Input
							id="edit-feed-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					{error && <p className="text-destructive text-sm">{error}</p>}
					<DialogFooter>
						<DialogClose render={<Button type="button" variant="ghost" />}>
							Cancel
						</DialogClose>
						<Button type="submit" disabled={mutation.isPending}>
							{mutation.isPending ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
