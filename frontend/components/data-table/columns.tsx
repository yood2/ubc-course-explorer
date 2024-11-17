import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { labels, priorities, statuses } from "../data/data";
import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<Task>[] = [
	{
		accessorKey: "uuid",
		header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
		cell: ({ row }) => <div className="w-[80px]">{row.getValue("uuid")}</div>,
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "id",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
		cell: ({ row }) => {
			const label = labels.find((label) => label.value === row.original.label);

			return (
				<div className="flex space-x-2">
					<span className="max-w-[500px] truncate font-medium">{row.getValue("id")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "title",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
		cell: ({ row }) => {
			const label = labels.find((label) => label.value === row.original.label);

			return (
				<div className="flex space-x-2">
					<span className="max-w-[500px] truncate font-medium">{row.getValue("title")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "instructor",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Prof." />,
		cell: ({ row }) => {
			const label = labels.find((label) => label.value === row.original.label);

			return (
				<div className="flex space-x-2">
					<span className="max-w-[500px] truncate font-medium">{row.getValue("instructor")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "dept",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
		cell: ({ row }) => {
			const label = labels.find((label) => label.value === row.original.label);

			return (
				<div className="flex space-x-2">
					<span className="max-w-[500px] truncate font-medium">{row.getValue("dept")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "year",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Year" />,
		cell: ({ row }) => {
			const label = labels.find((label) => label.value === row.original.label);

			return (
				<div className="flex space-x-2">
					<span className="max-w-[500px] truncate font-medium">{row.getValue("year")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "avg",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Avg." />,
		cell: ({ row }) => {
			const label = labels.find((label) => label.value === row.original.label);

			return (
				<div className="flex space-x-2">
					<span className="max-w-[500px] truncate font-medium">{row.getValue("avg")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "pass",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Pass" />,
		cell: ({ row }) => {
			const label = labels.find((label) => label.value === row.original.label);

			return (
				<div className="flex space-x-2">
					<span className="max-w-[500px] truncate font-medium">{row.getValue("pass")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "fail",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Fail" />,
		cell: ({ row }) => {
			const label = labels.find((label) => label.value === row.original.label);

			return (
				<div className="flex space-x-2">
					<span className="max-w-[500px] truncate font-medium">{row.getValue("fail")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "audit",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Audit" />,
		cell: ({ row }) => {
			const label = labels.find((label) => label.value === row.original.label);

			return (
				<div className="flex space-x-2">
					<span className="max-w-[500px] truncate font-medium">{row.getValue("audit")}</span>
				</div>
			);
		},
	},
	// {
	// 	id: "actions",
	// 	cell: ({ row }) => <DataTableRowActions row={row} />,
	// },
];

// export const columns: ColumnDef<Task>[] = [
// 	{
// 		accessorKey: "id",
// 		header: ({ column }) => <DataTableColumnHeader column={column} title="Task" />,
// 		cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
// 		enableSorting: false,
// 		enableHiding: false,
// 	},
// 	{
// 		accessorKey: "title",
// 		header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
// 		cell: ({ row }) => {
// 			const label = labels.find((label) => label.value === row.original.label);

// 			return (
// 				<div className="flex space-x-2">
// 					<span className="max-w-[500px] truncate font-medium">{row.getValue("title")}</span>
// 				</div>
// 			);
// 		},
// 	},
// 	{
// 		accessorKey: "status",
// 		header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
// 		cell: ({ row }) => {
// 			const status = statuses.find((status) => status.value === row.getValue("status"));

// 			if (!status) {
// 				return null;
// 			}

// 			return (
// 				<div className="flex w-[100px] items-center">
// 					{status.icon && <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
// 					<span>{status.label}</span>
// 				</div>
// 			);
// 		},
// 		filterFn: (row, id, value) => {
// 			return value.includes(row.getValue(id));
// 		},
// 	},
// 	{
// 		accessorKey: "priority",
// 		header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
// 		cell: ({ row }) => {
// 			const priority = priorities.find((priority) => priority.value === row.getValue("priority"));

// 			if (!priority) {
// 				return null;
// 			}

// 			return (
// 				<div className="flex items-center">
// 					{priority.icon && <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
// 					<span>{priority.label}</span>
// 				</div>
// 			);
// 		},
// 		filterFn: (row, id, value) => {
// 			return value.includes(row.getValue(id));
// 		},
// 	},
// 	{
// 		id: "actions",
// 		cell: ({ row }) => <DataTableRowActions row={row} />,
// 	},
// ];
