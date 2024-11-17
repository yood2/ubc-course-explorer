import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";

import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { statuses } from "../data/data";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface DataTableViewOptionsProps<TData> {
	table: Table<TData>;
}

const options = statuses;

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
	// State to keep track of visible columns
	const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

	useEffect(() => {
		// Initialize visible columns on mount
		const initialVisibleColumns = table
			.getAllColumns()
			.filter((column) => column.getIsVisible())
			.map((column) => column.id);
		setVisibleColumns(initialVisibleColumns);
	}, [table]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
					<Settings2 />
					Filters
					{visibleColumns?.length > 0 && (
						<>
							<Separator orientation="vertical" className="mx-2 h-4" />
							<Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
								{visibleColumns.length}
							</Badge>
							<div className="hidden space-x-1 lg:flex">
								{visibleColumns.length > 2 ? (
									<Badge variant="secondary" className="rounded-sm px-1 font-normal">
										{visibleColumns.length} selected
									</Badge>
								) : (
									options
										.filter((option) => visibleColumns.has(option.value))
										.map((option) => (
											<Badge variant="secondary" key={option.value} className="rounded-sm px-1 font-normal">
												{option.label}
											</Badge>
										))
								)}
							</div>
						</>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[150px]">
				<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{table
					.getAllColumns()
					.filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
					.map((column) => {
						return (
							<DropdownMenuCheckboxItem
								key={column.id}
								className="capitalize"
								checked={column.getIsVisible()}
								onCheckedChange={(value) => column.toggleVisibility(!!value)}
							>
								{column.id}
							</DropdownMenuCheckboxItem>
						);
					})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
