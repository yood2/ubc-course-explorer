"use client";

import { useState, useEffect } from "react";
import { InsightDataset } from "./insight-form/insight-dataset";
import { InsightYear } from "./insight-form/insight-year";
import { InsightDept } from "./insight-form/insight-dept";
import { InsightId } from "./insight-form/insight-id";
import { InsightType } from "./insight-form/insight-type";
import { Button } from "@/components/ui/button";
import { performQuery } from "../utils/api-utils";
import { PassFail } from "./visuals/pass-fail";
import { AuditParticipation } from "./visuals/audit-participation";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { getOptions } from "../utils/api-utils";
import { getYears, getDepts, getIds, queryGenerator } from "./insight-utils/insight-utils";

export default function Insights() {
	const [selectedDataset, setSelectedDataset] = useState<string>("");
	const [selectedYear, setSelectedYear] = useState<number>(0);
	const [selectedDept, setSelectedDept] = useState<string>("");
	const [selectedId, setSelectedId] = useState<string>("");
	const [selectedType, setSelectedType] = useState<string>("");
	const [query, setQuery] = useState<{}>({});
	const [insightResults, setInsightResults] = useState<[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
	const [options, setOptions] = useState<[]>([]);
	const [years, setYears] = useState<number[]>([]);
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
		const years: number[] = getYears(options, selectedDataset);
		setYears(years);
	}, [options]);

	useEffect(() => {
		const depts: string[] = getDepts(options, selectedDataset, selectedYear);
		setDepts(depts);
	}, [selectedYear]);

	useEffect(() => {
		const ids: string[] = getIds(options, selectedDataset, selectedYear, selectedDept);
		setIds(ids);
	}, [selectedDept]);

	const handleQuery = async (newQuery: Object) => {
		try {
			const { result, error } = await performQuery(newQuery);
			if (error) {
				alert(`${error}`);
				return;
			} else {
				setInsightResults(result);
				alert(`Query successful!`);
			}
		} catch (e) {
			alert("caught error");
		}
	};

	const handleSubmit = () => {
		const newQuery: Object = queryGenerator(selectedDataset, selectedYear, selectedDept, selectedId);
		setQuery(newQuery);
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
			<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Insights</h3>
			<div className="space-y-2">
				<div className="space-x-2">
					<InsightDataset selectedDataset={selectedDataset} setSelectedDataset={setSelectedDataset} />
					<InsightYear
						selectedDataset={selectedDataset}
						years={years}
						selectedYear={selectedYear}
						setSelectedYear={setSelectedYear}
					/>
					<InsightDept
						selectedYear={selectedYear}
						depts={depts}
						selectedDept={selectedDept}
						setSelectedDept={setSelectedDept}
					/>
				</div>
				<div className="space-x-2">
					<InsightId selectedDept={selectedDept} ids={ids} selectedId={selectedId} setSelectedId={setSelectedId} />
					<InsightType
						selectedDataset={selectedDataset}
						selectedType={selectedType}
						setSelectedType={setSelectedType}
					/>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button
								disabled={
									selectedDataset === "" ||
									selectedYear === 0 ||
									selectedDept === "" ||
									selectedId === "" ||
									selectedType === ""
								}
							>
								Submit
							</Button>
						</DialogTrigger>
						<DialogContent className="w-[300px]">
							<DialogHeader>
								<DialogTitle>Getting Insights</DialogTitle>
							</DialogHeader>
							<DialogDescription>Would you like to get insights with the following settings?</DialogDescription>
							<Button onClick={handleSubmit}>Confirm</Button>
						</DialogContent>
					</Dialog>
				</div>
			</div>
			{selectedType === "pass/fail" && insightResults.length !== 0 && <PassFail data={insightResults} />}
			{selectedType === "audit participation" && insightResults.length !== 0 && (
				<AuditParticipation data={insightResults} datasetId={selectedDataset} />
			)}
			{/* <pre>{JSON.stringify(query, null, 2)}</pre> */}
			{/* <pre>{JSON.stringify(insightResults, null, 2)}</pre> */}
		</>
	);
}
