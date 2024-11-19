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
import { Bug } from "lucide-react";
import { useInsightContext } from "@/context/context";
import { InsightDataset, InsightDatasetKind } from "@/types/schema";

const DummyDatasets = ["test", "test2"];

const DummyQuery = [
	{
		sections_dept: "math",
		sections_avg: 97.09,
	},
	{
		sections_dept: "math",
		sections_avg: 97.09,
	},
	{
		sections_dept: "epse",
		sections_avg: 97.09,
	},
];

export default function Debug() {
	const { datasets, queryResults, setDatasets, setQueryResults } = useInsightContext();

	const HandleDummyData = () => {
		setDatasets(DummyDatasets);
		// setQueryResults(DummyQuery);
	};

	const HandleDataReset = () => {
		setDatasets([]);
		setQueryResults([]);
	};

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
					<div>
						<pre>Datasets:{JSON.stringify(datasets, null, 2)}</pre>
						<br />
						<pre>Query Results:{JSON.stringify(queryResults, null, 2)}</pre>

						<br />
					</div>
					<Button variant="outline" onClick={HandleDummyData}>
						Load Dummy Data
					</Button>
					<Button variant="outline" onClick={HandleDataReset}>
						Clear Data
					</Button>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
