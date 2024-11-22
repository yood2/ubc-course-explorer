"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart";

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

interface PassFailProps {
	data: Object[];
}

export function PassFail({ data }: PassFailProps) {
	const chartData = stripData(data);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Pass/Fail</CardTitle>
				<CardDescription>Comparing number of students who passed and failed for each course.</CardDescription>
			</CardHeader>
			<CardContent>
				{chartData.length > 0 ? (
					<ChartContainer config={chartConfig}>
						<BarChart accessibilityLayer data={chartData}>
							<CartesianGrid vertical={false} />
							<XAxis dataKey="course" tick={false} tickLine={false} tickMargin={10} axisLine={false} />
							<Bar dataKey="pass" stackId="a" fill="var(--color-pass)" radius={[0, 0, 4, 4]} barSize={60} />
							<Bar dataKey="fail" stackId="a" fill="var(--color-fail)" radius={[4, 4, 0, 0]} barSize={60} />
							<ChartLegend content={<ChartLegendContent />} />
							<ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={false} defaultIndex={0} />
						</BarChart>
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
		let instructor = "";

		for (const [key, value] of Object.entries(item)) {
			const strippedKey: string = key.split("_")[1];

			if (strippedKey === "dept") {
				dept = value as string;
			} else if (strippedKey === "id") {
				id = value as string;
			} else if (strippedKey === "instructor") {
				instructor = value as string;
			} else {
				newObject[strippedKey] = value;
			}
		}

		if (dept && id && instructor) {
			newObject.course = `${dept} ${id} - ${instructor}`;
		} else if (dept && id) {
			newObject.course = `${dept} ${id}`;
		}

		return newObject;
	});
}
