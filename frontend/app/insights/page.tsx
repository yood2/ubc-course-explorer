"use client";

import { useState } from "react";
import { PassFailChart } from "@/components/bar-charts/pass-fail-chart";
import { InsightDataset } from "./insight-form/insight-dataset";
import { InsightYear } from "./insight-form/insight-year";

export default function Insights() {
	const [selectedDataset, setSelectedDataset] = useState<string>("");
	const [selectedYear, setSelectedYear] = useState<number>(2000);

	return (
		<>
			<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Insights</h3>
			<div className="space-x-2">
				<InsightDataset selectedDataset={selectedDataset} setSelectedDataset={setSelectedDataset} />
				<InsightYear selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
			</div>
			<PassFailChart />
		</>
	);
}
