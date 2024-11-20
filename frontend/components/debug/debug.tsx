"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bug } from "lucide-react";
import { useInsightContext } from "@/context/context";

export default function Debug() {
	const { datasets, queryResults } = useInsightContext();

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="h-8 lg:flex">
					<Bug />
					Debug
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Current State</DialogTitle>
					<ScrollArea className="h-[200px] w-[400px] rounded-md border">
						<pre>Datasets:{JSON.stringify(datasets, null, 2)}</pre>
						<br />
						<pre>Query Results:{JSON.stringify(queryResults, null, 2)}</pre>

						<br />
					</ScrollArea>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
