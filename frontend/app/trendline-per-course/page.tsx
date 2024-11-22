"use client";

import { useState, useEffect } from "react";
import { InsightDataset } from "./insight-form/insight-dataset";
import { InsightDept } from "./insight-form/insight-dept";
import { InsightId } from "./insight-form/insight-id";
import { Button } from "@/components/ui/button";
import { performQuery } from "../utils/api-utils";
import { AverageTrendline } from "./visuals/average-trendline";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { getOptions } from "../utils/api-utils";
import { getDepts, getIds, queryGenerator } from "./insight-utils/insight-utils";

export default function Trendlines() {
	const [selectedDataset, setSelectedDataset] = useState<string>("");
	const [selectedDept, setSelectedDept] = useState<string>("");
	const [selectedId, setSelectedId] = useState<string>("");
	const [insightResults, setInsightResults] = useState<[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
	const [options, setOptions] = useState<[]>([]);
	const [depts, setDepts] = useState<string[]>([]);
	const [ids, setIds] = useState<string[]>([]);

	useEffect(() => {
		const fetchOptions = async () => {
			try {
				const options = await requestOptions(selectedDataset);
				setOptions(options);
			} catch (error) {
				console.error("Error fetching options:", error);
			}
		};

		if (selectedDataset) {
			fetchOptions();
		}
	}, [selectedDataset]);

	useEffect(() => {
		if (options.length > 0 && selectedDataset) {
			const depts: string[] = getDepts(options, selectedDataset);
			setDepts(depts);
		}
	}, [options, selectedDataset]);

	useEffect(() => {
		if (options.length > 0 && selectedDataset && selectedDept) {
			const ids: string[] = getIds(options, selectedDataset, selectedDept);
			setIds(ids);
		}
	}, [options, selectedDataset, selectedDept]);

	const handleQuery = async (newQuery: Object) => {
		try {
			const { result, error } = await performQuery(newQuery);
			if (error) {
				alert(`${error}`);
				return;
			} else {
				setInsightResults(result);
				alert("Successfully queried!");
			}
		} catch (e) {
			alert("caught error");
		}
	};

	const handleSubmit = () => {
		const newQuery: Object = queryGenerator(selectedDataset, selectedDept, selectedId);
		handleQuery(newQuery);
		setIsDialogOpen(false);
	};

	const requestOptions = async (selectedDataset: string) => {
		const { result, error } = await getOptions(selectedDataset);
		if (error) {
			console.log(error);
			alert(`${error}`);
			return;
		} else {
			setOptions(result);
			return result;
		}
	};

	return (
		<>
			<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Trendlines</h3>
			<div className="space-y-2">
				<div className="space-x-2">
					<InsightDataset selectedDataset={selectedDataset} setSelectedDataset={setSelectedDataset} />
					<InsightDept
						selectedDataset={selectedDataset}
						depts={depts}
						selectedDept={selectedDept}
						setSelectedDept={setSelectedDept}
					/>
				</div>
				<div className="space-x-2">
					<InsightId selectedDept={selectedDept} ids={ids} selectedId={selectedId} setSelectedId={setSelectedId} />
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button disabled={selectedDataset === "" || selectedDept === "" || selectedId === ""}>Submit</Button>
						</DialogTrigger>
						<DialogContent className="w-[300px]">
							<DialogHeader>
								<DialogTitle>Getting Trendline</DialogTitle>
							</DialogHeader>
							<DialogDescription>Would you like to get trendline with the following settings?</DialogDescription>
							<Button onClick={handleSubmit}>Confirm</Button>
						</DialogContent>
					</Dialog>
				</div>
			</div>
			{insightResults.length !== 0 && <AverageTrendline data={insightResults} />}
		</>
	);
}
