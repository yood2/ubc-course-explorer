"use client";

import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./components/data-table/columns";
import AddDataset from "./components/add-dataset";
import { useInsightContext } from "@/context/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Home() {
	const { datasets, setDatasets } = useInsightContext();

	return (
		<>
			<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Manage</h3>
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline">Add Dataset</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80">
					<div className="grid gap-4">
						<div className="space-y-2">
							<h4 className="font-medium leading-none">Add Dataset</h4>
						</div>
						<div className="grid gap-2">
							<AddDataset />
						</div>
					</div>
				</PopoverContent>
			</Popover>
			<DataTable data={datasets} columns={columns} />
		</>
	);
}
