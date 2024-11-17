"use client";

import { QueryColumns } from "./query-columns";
import { QueryDataset } from "./query-dataset";
import { QueryOrder } from "./query-order";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function QueryForm() {
	const [selectedDataset, setSelectedDataset] = useState<string>("");
	const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
	const [selectedOrder, setSelectedOrder] = useState<string>("");
	const [query, setQuery] = useState<{}>({});

	// need to implement form checking
	const handleSubmit = () => {
		const cols = selectedColumns.map((column) => `${selectedDataset}_${column}`);
		const order = `${selectedDataset}_${selectedOrder}`;

		const newQuery = {
			WHERE: {},
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
			<Button onClick={handleSubmit}>Query</Button>
			<p>Query: {JSON.stringify(query, null, 2)}</p>
		</>
	);
}
