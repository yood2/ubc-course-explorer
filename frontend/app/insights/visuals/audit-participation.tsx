"use client";

import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

function aggregateData(rawData: Object[], datasetId: string) {
	const aggregated = { enrolled: 0, audit: 0 };

	const passKey = `${datasetId}_pass`;
	const failKey = `${datasetId}_fail`;
	const auditKey = `${datasetId}_audit`;

	rawData.forEach((row: any) => {
		const pass = Number(row[passKey] || 0); // Default to 0 if undefined
		const fail = Number(row[failKey] || 0); // Default to 0 if undefined
		const audit = Number(row[auditKey] || 0); // Default to 0 if undefined

		aggregated.enrolled += pass;
		aggregated.enrolled += fail;
		aggregated.audit += audit;
	});

	return [
		{ name: "Enrolled", value: aggregated.enrolled, fill: "var(--color-enrolled)" },
		{ name: "Audit", value: aggregated.audit, fill: "var(--color-audit)" },
	];
}

const chartConfig = {
	enrolled: {
		label: "Enrolled",
		color: "hsl(var(--chart-1))",
	},
	audit: {
		label: "Audit",
		color: "hsl(var(--chart-2))",
	},
} satisfies ChartConfig;

interface AuditParticipationProps {
	data: Object[];
	datasetId: string;
}

export function AuditParticipation({ data, datasetId }: AuditParticipationProps) {
	const chartData = aggregateData(data, datasetId);

	return (
		<Card className="flex flex-col">
			<CardHeader className="items-center pb-0">
				<CardTitle>Audit Participation</CardTitle>
				<CardDescription>
					Shows the portion of enrolled students versus the amount of audit participants.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				<ChartContainer
					config={chartConfig}
					className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
				>
					<PieChart>
						<ChartTooltip content={<ChartTooltipContent hideLabel />} />
						<Pie data={chartData} dataKey="value" label nameKey="name" />
					</PieChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className="flex-col gap-2 text-sm">
				<div className="leading-none text-muted-foreground">*Enrolled students calculated by combining pass/fails.</div>
			</CardFooter>
		</Card>
	);
}
