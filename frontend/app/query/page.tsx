"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./components/data-table/columns";
import { useInsightContext } from "@/context/context";
import { QueryDataset } from "./components/query-form/query-dataset";
import { QueryColumns } from "./components/query-form/query-columns";
import { QueryFilter } from "./components/query-form/query-filter";
import { QueryOrder } from "./components/query-form/query-order";
import { Button } from "@/components/ui/button";
import { performQuery } from "../utils/api-utils";

export default function Query() {
	const { queryResults, setQueryResults } = useInsightContext();
	const [selectedDataset, setSelectedDataset] = useState<string>("");
	const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
	const [selectedOrder, setSelectedOrder] = useState<string>("");
	const [filters, setFilters] = useState<{}>({
		GT: {
			sections_avg: 99,
		},
	});
	const [query, setQuery] = useState<{}>({});

	const handleQuery = async () => {
		const prefixedColumns = selectedColumns.map((column) => `${selectedDataset}_${column}`);

		const newQuery = {
			WHERE: filters,
			OPTIONS: {
				COLUMNS: prefixedColumns,
				ORDER: `${selectedDataset}_${selectedOrder}`,
			},
		};

		setQuery(newQuery);

		try {
			const { result, error } = await performQuery(newQuery);
			if (error) {
				alert(`error: ${error.message}`);
				return;
			} else {
				setQueryResults(result);
				alert(`success: ${JSON.stringify(result)}`);
			}
		} catch (e) {
			alert("caught error");
		}
	};

	return (
		<>
			<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Query</h3>
			<div>
				<QueryDataset selectedDataset={selectedDataset} setSelectedDataset={setSelectedDataset} />
				<QueryColumns
					selectedDataset={selectedDataset}
					selectedColumns={selectedColumns}
					setSelectedColumns={setSelectedColumns}
				/>
				<QueryOrder
					selectedColumns={selectedColumns}
					selectedOrder={selectedOrder}
					setSelectedOrder={setSelectedOrder}
				/>
				<QueryFilter selectedOrder={selectedOrder} filters={filters} setFilters={setFilters} />
				<Button onClick={handleQuery}>Query</Button>
			</div>
			<DataTable data={queryResults} columns={columns} />
			<pre>{JSON.stringify(query, null, 2)}</pre>
			<pre>{JSON.stringify(queryResults, null, 2)}</pre>
		</>
	);
}
