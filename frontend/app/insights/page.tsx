"use client";

import { useState } from "react";
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

export default function Insights() {
	const [selectedDataset, setSelectedDataset] = useState<string>("");
	const [selectedYear, setSelectedYear] = useState<number>(0);
	const [selectedDept, setSelectedDept] = useState<string>("");
	const [selectedId, setSelectedId] = useState<string>("");
	const [selectedType, setSelectedType] = useState<string>("");
	const [query, setQuery] = useState<{}>({});
	const [insightResults, setInsightResults] = useState<[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

	const handleQuery = async (newQuery: Object) => {
		try {
			const { result, error } = await performQuery(newQuery);
			if (error) {
				console.log(error);
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
		let newQuery: Object = {};
		if (selectedType === "pass/fail") {
			newQuery = passFailQueryGenerator(selectedDataset, selectedYear, selectedDept, selectedId);
		} else if (selectedType === "audit participation") {
			newQuery = auditQueryGenerator(selectedDataset, selectedYear, selectedDept, selectedId);
		}
		setQuery(newQuery);
		handleQuery(newQuery);
	};

	return (
		<>
			<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Insights</h3>
			<div className="space-y-2">
				<div className="space-x-2">
					<InsightYear selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
					<InsightDept selectedYear={selectedYear} selectedDept={selectedDept} setSelectedDept={setSelectedDept} />
					<InsightId selectedDept={selectedDept} selectedId={selectedId} setSelectedId={setSelectedId} />
				</div>
				<div className="space-x-2">
					<InsightDataset
						selectedId={selectedId}
						selectedDataset={selectedDataset}
						setSelectedDataset={setSelectedDataset}
					/>
					<InsightType
						selectedDataset={selectedDataset}
						selectedType={selectedType}
						setSelectedType={setSelectedType}
					/>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button>Submit</Button>
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
			<PassFail data={insightResults} />
			<AuditParticipation />
			{/* <pre>{JSON.stringify(query, null, 2)}</pre> */}
			{/* <pre>{JSON.stringify(insightResults, null, 2)}</pre> */}
		</>
	);
}

function passFailQueryGenerator(
	selectedDataset: string,
	selectedYear: number,
	selectedDept: string,
	selectedId: string
) {
	const yearCol = `${selectedDataset}_year`;
	const deptCol = `${selectedDataset}_dept`;
	const idCol = `${selectedDataset}_id`;
	const failCol = `${selectedDataset}_fail`;
	const passCol = `${selectedDataset}_pass`;

	const query = {
		WHERE: {
			AND: [
				{
					EQ: {
						[yearCol]: selectedYear,
					},
				},
				{
					IS: {
						[deptCol]: selectedDept,
					},
				},
				{
					IS: {
						[idCol]: selectedId,
					},
				},
			],
		},
		OPTIONS: {
			COLUMNS: [idCol, deptCol, failCol, passCol],
			ORDER: failCol,
		},
	};

	return query;
}

function auditQueryGenerator(selectedDataset: string, selectedYear: number, selectedDept: string, selectedId: string) {
	const yearCol = `${selectedDataset}_year`;
	const deptCol = `${selectedDataset}_dept`;
	const idCol = `${selectedDataset}_id`;
	const failCol = `${selectedDataset}_fail`;
	const passCol = `${selectedDataset}_pass`;
	const auditCol = `${selectedDataset}_pass`;

	const query = {
		WHERE: {
			AND: [
				{
					EQ: {
						[yearCol]: selectedYear,
					},
				},
				{
					IS: {
						[deptCol]: selectedDept,
					},
				},
				{
					IS: {
						[idCol]: selectedId,
					},
				},
			],
		},
		OPTIONS: {
			COLUMNS: [idCol, deptCol, failCol, passCol, auditCol],
			ORDER: failCol,
		},
	};

	return query;
}
