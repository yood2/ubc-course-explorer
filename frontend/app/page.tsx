import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function Home() {
	return (
		<div className="p-6 space-y-6">
			<h3 className="text-3xl font-bold tracking-tight text-center">Welcome to Sections Insights</h3>
			<p className="text-lg text-center text-muted-foreground">
				Explore and analyze your course datasets effortlessly.
			</p>
			<Card>
				<CardHeader></CardHeader>
				<CardContent>
					<ul className="space-y-4 list-disc pl-6">
						<li>
							<strong>Manage</strong>: Add, remove, and view datasets, with all changes saved for future sessions.
						</li>
						<li>
							<strong>Insights</strong>: Get focused insights into specific courses by selecting a year, department, and
							course ID.
						</li>
						<li>
							<strong>Insights</strong>: View how course averages change over several years.
						</li>
						<li>
							<strong>Query</strong>: Use the Course Explorer EBNF language to create custom queries for advanced data
							analysis.
						</li>
						<li>
							<strong>Summary</strong>: Review a personalized summary of your searches and insights all in one place.
						</li>
					</ul>
				</CardContent>
				<CardFooter></CardFooter>
			</Card>
		</div>
	);
}
