"use client";

import { DataTable } from "@/components/data-table/data-table";
import { QueryForm } from "./components/query-form/query-form";
import { columns } from "./components/data-table/columns";
import { useInsightContext } from "@/context/context";

export default function Query() {
	const { queryResults } = useInsightContext();

	return (
		<>
			<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Query</h3>
			<QueryForm />
			<DataTable data={queryResults} columns={columns} />
		</>
	);
}
