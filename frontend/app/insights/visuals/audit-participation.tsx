"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const rawData = [
	{
		sections_id: "110",
		sections_dept: "cpsc",
		sections_fail: 1,
		sections_pass: 69,
	},
	{
		sections_id: "110",
		sections_dept: "cpsc",
		sections_fail: 6,
		sections_pass: 23,
	},
	{
		sections_id: "110",
		sections_dept: "cpsc",
		sections_fail: 8,
		sections_pass: 21,
	},
	{
		sections_id: "110",
		sections_dept: "cpsc",
		sections_fail: 22,
		sections_pass: 154,
	},
	{
		sections_id: "110",
		sections_dept: "cpsc",
		sections_fail: 25,
		sections_pass: 104,
	},
	{
		sections_id: "110",
		sections_dept: "cpsc",
		sections_fail: 40,
		sections_pass: 256,
	},
	{
		sections_id: "110",
		sections_dept: "cpsc",
		sections_fail: 42,
		sections_pass: 154,
	},
	{
		sections_id: "110",
		sections_dept: "cpsc",
		sections_fail: 46,
		sections_pass: 185,
	},
];

// Aggregate data for the PieChart
function aggregateData(rawData: Object[]) {
	const aggregated = { pass: 0, fail: 0 };

	rawData.forEach((row) => {
		aggregated.pass += row.sections_pass;
		aggregated.fail += row.sections_fail;
	});

	return [
		{ name: "Pass", value: aggregated.pass, fill: "var(--color-pass)" },
		{ name: "Fail", value: aggregated.fail, fill: "var(--color-fail)" },
	];
}

const chartConfig = {
	pass: {
		label: "Pass",
		color: "hsl(var(--chart-1))",
	},
	fail: {
		label: "Fail",
		color: "hsl(var(--chart-2))",
	},
} satisfies ChartConfig;

export function AuditParticipation() {
	const chartData = aggregateData(rawData);

	return (
		<Card className="flex flex-col">
			<CardHeader className="items-center pb-0">
				<CardTitle>Pass/Fail Distribution</CardTitle>
				<CardDescription>Aggregated data for all sections</CardDescription>
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
				<div className="flex items-center gap-2 font-medium leading-none">
					Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
				</div>
				<div className="leading-none text-muted-foreground">Aggregated pass/fail data for all sections</div>
			</CardFooter>
		</Card>
	);
}
