import { ColumnDef } from "@tanstack/react-table";

import { labels, priorities, statuses } from "@/components/data/data";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<{ id: string; kind: string; numRows: number }>[] = [
	{
		accessorKey: "id",
		header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
		cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "kind",
		header: ({ column }) => <DataTableColumnHeader column={column} title="kind" />,
		cell: ({ row }) => {
			return (
				<div className="flex space-x-2">
					<span className="max-w-[500px] truncate font-medium">{row.getValue("kind")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "numRows",
		header: ({ column }) => <DataTableColumnHeader column={column} title="NumRows" />,
		cell: ({ row }) => {
			return (
				<div className="flex space-x-2">
					<span className="max-w-[500px] truncate font-medium">{row.getValue("numRows")}</span>
				</div>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => <DataTableRowActions row={row} />,
	},
];
