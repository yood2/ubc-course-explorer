"use client";

import { QueryColumns } from "./query-columns";
import { QueryDataset } from "./query-dataset";
import QueryFilters from "./query-filters";
import { QueryOrder } from "./query-order";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function QueryForm() {
	const [selectedDataset, setSelectedDataset] = useState<string>(""); // Selected dataset
	const [selectedColumns, setSelectedColumns] = useState<string[]>([]); // Selected columns
	const [selectedOrder, setSelectedOrder] = useState<string>(""); // Selected order
	const [filters, setFilters] = useState<Record<string, Record<string, string>> | null>(null); // Filters object
	const [query, setQuery] = useState<{} | null>(null); // Final query object

	// Handle form submission
	const handleSubmit = () => {
		const cols = selectedColumns.map((column) => `${selectedDataset}_${column}`);
		const order = selectedOrder ? [`${selectedDataset}_${selectedOrder}`] : [];

		const newQuery = {
			WHERE: filters || {}, // Use filters if they exist
			OPTIONS: {
				COLUMNS: cols,
				ORDER: order,
			},
		};
		setQuery(newQuery);
	};

	return (
		<>
			<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Query</h3>
			<QueryDataset selectedDataset={selectedDataset} setSelectedDataset={setSelectedDataset} />
			<br />
			<QueryColumns
				selectedDataset={selectedDataset}
				selectedColumns={selectedColumns}
				setSelectedColumns={setSelectedColumns}
			/>
			<QueryOrder selectedColumns={selectedColumns} selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} />
			<br />
			<QueryFilters columns={selectedColumns.map((column) => `${selectedDataset}_${column}`)} setFilters={setFilters} />
			<br />
			<Button onClick={handleSubmit}>Query</Button>
			{query && (
				<div className="mt-4 p-2 border border-gray-200 rounded bg-gray-50">
					<pre>Query: {JSON.stringify(query, null, 2)}</pre>
				</div>
			)}
		</>
	);
}
