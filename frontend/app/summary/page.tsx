"use client";

import { Button } from "@/components/ui/button";
import { Facebook, Twitter } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useInsightContext } from "@/context/context";

export default function Summary() {
	const { summary } = useInsightContext();

	if (!summary || summary.highestAvg === null || summary.mostCommonDept === null || summary.mostFails === null) {
		return (
			<>
				<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Summary</h3>
				<p>No data available yet! Perform some searches to see insights here.</p>
			</>
		);
	}

	return (
		<>
			<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Summary</h3>
			<Card>
				<CardHeader>
					<CardTitle>Based off of your searches...</CardTitle>
					<CardDescription>A summary of the key insights from your recent queries:</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col items-center text-center space-y-6">
						<div>
							<h4 className="scroll-m-20 text-2xl font-semibold tracking-tight">
								The course with the highest average:
							</h4>
							<p>
								<strong>Course:</strong>{" "}
								{summary.highestAvg && summary.selectedDataset
									? `${summary.highestAvg[`${summary.selectedDataset}_dept`].toUpperCase()} ${
											summary.highestAvg[`${summary.selectedDataset}_id`]
									  }` || "N/A"
									: "N/A"}
							</p>
							<p>
								<strong>Average:</strong> {summary.highestAvg ? `${(summary.highestAvg.avg * 100).toFixed(2)}%` : "N/A"}
							</p>
						</div>
						<div>
							<h4 className="scroll-m-20 text-2xl font-semibold tracking-tight">The course with the most fails:</h4>
							<p>
								<strong>Course:</strong>{" "}
								{summary.mostFails && summary.selectedDataset
									? `${summary.mostFails[`${summary.selectedDataset}_dept`].toUpperCase()} ${
											summary.mostFails[`${summary.selectedDataset}_id`]
									  }` || "N/A"
									: "N/A"}
							</p>
							<p>
								<strong>Fails:</strong> {summary.mostFails ? summary.mostFails.fails : "N/A"}
							</p>
						</div>
						<div>
							<h4 className="scroll-m-20 text-2xl font-semibold tracking-tight">The most common department:</h4>
							<p>
								<strong>Department:</strong> {summary.mostCommonDept.toUpperCase() || "N/A"}
							</p>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col items-center text-center">
					<div className="space-y-4">
						<CardDescription>Share these insights with your friends!</CardDescription>
						<div className="flex gap-4">
							<a href="https://www.facebook.com/">
								<Button className="flex items-center space-x-2">
									<Facebook />
									Facebook
								</Button>
							</a>
							<a href="https://www.twitter.com">
								<Button className="flex items-center space-x-2">
									<Twitter />
									Twitter
								</Button>
							</a>
						</div>
					</div>
				</CardFooter>
			</Card>
		</>
	);
}
