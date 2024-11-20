import { PassFailChart } from "@/components/bar-charts/pass-fail-chart";

interface DataVisualsProps {
	selectedDataset: string;
	selectedColumns: string[];
	queryResults: any[];
}

export default function DataVisuals() {
	return (
		<>
			<PassFailChart />
		</>
	);
}
