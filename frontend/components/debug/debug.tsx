import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
					<DialogDescription>
						<p>
							Datasets:
							<pre>{JSON.stringify(datasets, null, 2)}</pre>
							<br />
						</p>
						<p>
							Query Results:
							<pre>{JSON.stringify(queryResults, null, 2)}</pre>
						</p>
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
