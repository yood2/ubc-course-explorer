"use client";

import { useState, useEffect } from "react";
import { useInsightContext } from "@/context/context";
import { QueryDataset } from "./components/query-form/query-dataset";
import { QueryColumns } from "./components/query-form/query-columns";
import { QueryFilter } from "./components/query-form/query-filter";
import { QueryOrder } from "./components/query-form/query-order";
import { QueryTable } from "./components/data-table/query-table";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { performQuery } from "../utils/api-utils";

export default function Query() {
	const { queryResults, setQueryResults } = useInsightContext();
	const [selectedDataset, setSelectedDataset] = useState<string>("");
	const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
	const [selectedOrder, setSelectedOrder] = useState<string>("");
	const [filters, setFilters] = useState<{}>({});
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

	const handleQuery = async () => {
		const prefixedColumns = prefixColumns(selectedColumns, selectedDataset);

		const newQuery = {
			WHERE: filters,
			OPTIONS: {
				COLUMNS: prefixedColumns,
				ORDER: `${selectedDataset}_${selectedOrder}`,
			},
		};

		try {
			const { result, error } = await performQuery(newQuery);
			if (error) {
				console.log(error);
				alert(`${error}`);
				return;
			} else {
				setQueryResults(result);
				alert(`Query successful!`);
			}
		} catch (e) {
			alert("caught error");
		}
		setIsDialogOpen(false);
	};

	return (
		<>
			<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Query</h3>
			<div className="space-y-2">
				<div className="space-x-2">
					<QueryDataset
						selectedDataset={selectedDataset}
						setSelectedDataset={setSelectedDataset}
						setFilters={setFilters}
					/>
					<QueryColumns
						selectedDataset={selectedDataset}
						selectedColumns={selectedColumns}
						setSelectedColumns={setSelectedColumns}
					/>
				</div>
				<div className="space-x-2">
					<QueryOrder
						selectedColumns={selectedColumns}
						selectedOrder={selectedOrder}
						setSelectedOrder={setSelectedOrder}
					/>
					<QueryFilter selectedOrder={selectedOrder} filters={filters} setFilters={setFilters} />
					{/* <Button onClick={handleQuery}>Query</Button> */}
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button disabled={selectedDataset === "" || selectedColumns.length < 1 || selectedOrder === ""}>
								Query
							</Button>
						</DialogTrigger>
						<DialogContent className="w-[300px]">
							<DialogHeader>
								<DialogTitle>Querying Dataset</DialogTitle>
							</DialogHeader>
							<DialogDescription>Would you like to query with the following settings?</DialogDescription>
							<Button onClick={handleQuery}>Confirm</Button>
						</DialogContent>
					</Dialog>
				</div>
			</div>
			{queryResults.length > 0 && <QuerySummary />}
		</>
	);
}

function QuerySummary() {
	const { queryResults } = useInsightContext();
	return (
		<>
			<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Results</h3>
			<QueryTable data={queryResults} />
		</>
	);
}

function prefixColumns(cols: string[], prefix: string) {
	return cols.map((col) => `${prefix}_${col}`);
}
