"use client";

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
	avg: {
		label: "Average Grade",
		color: "hsl(var(--chart-1))",
	},
} satisfies ChartConfig;

interface AverageTrendlineProps {
	data: Object[];
}

export function AverageTrendline({ data }: AverageTrendlineProps) {
	const chartData = stripData(data);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Average Grade Trendline</CardTitle>
				<CardDescription>
					Showing the trendline of average grades over the years for the selected course.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{chartData.length > 0 ? (
					<ChartContainer config={chartConfig}>
						<LineChart width={500} height={300} data={chartData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="year" />
							<YAxis />
							<Tooltip content={<ChartTooltipContent indicator="line" />} />
							<Legend />
							<Line
								type="monotone"
								dataKey="Average Grade Per Year"
								stroke={chartConfig.avg.color}
								strokeWidth={2}
								activeDot={{ r: 8 }}
							/>
						</LineChart>
					</ChartContainer>
				) : (
					<>
						<CardTitle>No data was returned!</CardTitle>
						<CardDescription>Query was successful but no data was returned! Try a different course.</CardDescription>
					</>
				)}
			</CardContent>
		</Card>
	);
}

function stripData(original: Object[]) {
	return original.map((item) => {
		const newObject: { [key: string]: any } = {};
		let dept = "";
		let id = "";
		let year = "";
		let avgPerYear = "Average Grade Per Year";

		// Strip the dataset columns
		for (const [key, value] of Object.entries(item)) {
			const strippedKey: string = key.split("_")[1];

			if (strippedKey === "dept") {
				dept = value as string;
			} else if (strippedKey === "id") {
				id = value as string;
			} else if (strippedKey === "year") {
				year = value as string;
			} else {
				newObject[avgPerYear] = value;
			}
		}

		// Combine dept and id to form the course name
		if (dept && id && year) {
			newObject.course = `${dept} ${id}`;
			newObject.year = year; // Ensure year is included
			newObject[avgPerYear] = newObject[avgPerYear] || 0; // Default to 0 if avg is missing
		}

		return newObject;
	});
}
