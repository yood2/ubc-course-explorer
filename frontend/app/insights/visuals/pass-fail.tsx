import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
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
		color: "hsl(var(--chart-1))", // Adjust this color to a green shade
	},
	fail: {
		label: "Fail",
		color: "hsl(var(--chart-2))", // Adjust this color to a red shade
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
						<BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="course" tick={false} tickLine={false} tickMargin={10} axisLine={false} />
							<YAxis />
							<Tooltip content={<ChartTooltipContent indicator="line" />} cursor={false} defaultIndex={0} />
							<Legend content={<ChartLegendContent />} />
							{/* Fail Bar (on the left), slightly offset to the left */}
							<Bar dataKey="fail" fill="red" barSize={30} />
							{/* Pass Bar (on the right), slightly offset to the right */}
							<Bar dataKey="pass" fill="green" barSize={30} />
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
