"use client";

import { Bar, BarChart, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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
							<XAxis
								dataKey="course"
								tickLine={false}
								tickMargin={10}
								axisLine={false}
								tickFormatter={(value) => value.toUpperCase()}
							/>
							<Bar dataKey="pass" stackId="a" fill="var(--color-pass)" radius={[0, 0, 4, 4]} />
							<Bar dataKey="fail" stackId="a" fill="var(--color-fail)" radius={[4, 4, 0, 0]} />
							<ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={false} defaultIndex={0} />
						</BarChart>
					</ChartContainer>
				) : (
					<p>No data returned.</p>
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

		for (const [key, value] of Object.entries(item)) {
			const strippedKey: string = key.split("_")[1];

			if (strippedKey === "dept") {
				dept = value as string;
			} else if (strippedKey === "id") {
				id = value as string;
			} else {
				newObject[strippedKey] = value;
			}
		}

		if (dept && id) {
			newObject.course = `${dept} ${id}`;
		}

		return newObject;
	});
}
