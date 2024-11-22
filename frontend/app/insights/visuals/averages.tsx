"use client";

import { Activity } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
	average: {
		label: "Average",
		color: "hsl(var(--chart-1))",
		icon: Activity,
	},
} satisfies ChartConfig;

interface AveragesProps {
	data: [];
	selectedDataset: string;
}

export function Averages({ data, selectedDataset }: AveragesProps) {
	const processedData = data.map((item) => {
		const instructorKey = `${selectedDataset}_instructor`;
		const averageKey = `${selectedDataset}_avg`;

		return {
			instructor: item[instructorKey],
			average: item[averageKey],
		};
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Averages Line Chart</CardTitle>
				<CardDescription>Line Chart that visualizes the ranging averages for a course's sections.</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<AreaChart
						accessibilityLayer
						data={processedData}
						margin={{
							left: 12,
							right: 12,
						}}
					>
						<CartesianGrid vertical={false} />
						<YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={8} />
						<XAxis
							dataKey="instructor"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => value.split(",")[0]}
						/>
						<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
						<Area
							dataKey="average"
							type="linear"
							fill="var(--color-average)"
							fillOpacity={0.4}
							stroke="var(--color-average)"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
