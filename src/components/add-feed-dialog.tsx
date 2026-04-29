"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function AddFeedDialog() {
	const [open, setOpen] = useState(false);
	const [url, setUrl] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async () => {
			const res = await fetch("/api/feeds", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url, name: name || undefined }),
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to add feed");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["feeds"] });
			setUrl("");
			setName("");
			setError("");
			setOpen(false);
		},
		onError: (err: Error) => {
			setError(err.message);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={<Button size="icon" className="gap-1.5" />}>
				<Plus className="h-4 w-4" />
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Feed</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						mutation.mutate();
					}}
					className="flex flex-col gap-4"
				>
					<div className="flex flex-col gap-1">
						<label htmlFor="feed-url" className="font-medium text-sm">
							Feed URL
						</label>
						<Input
							id="feed-url"
							placeholder="https://example.com/feed.xml or …/articles.json"
							value={url}
							onChange={(e) => {
								setUrl(e.target.value);
								setError("");
							}}
							required
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label htmlFor="feed-name" className="font-medium text-sm">
							Name (optional)
						</label>
						<Input
							id="feed-name"
							placeholder="My Feed"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					{error && <p className="text-destructive text-sm">{error}</p>}
					<DialogFooter>
						<DialogClose
							render={<Button type="button" variant="destructive" />}
						>
							Cancel
						</DialogClose>
						<Button type="submit" disabled={mutation.isPending || !url}>
							{mutation.isPending ? "Adding..." : "Add Feed"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
