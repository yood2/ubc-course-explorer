import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

export const columns: ColumnDef<{
	uuid?: string;
	id?: string;
	title?: string;
	instructor?: string;
	dept?: string;
	year?: number;
	avg?: number;
	pass?: number;
	fail?: number;
	audit?: number;
}>[] = [
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
			return (
				<div className="flex space-x-2">
					<span className="max-w-[500px] truncate font-medium">{row.getValue("audit")}</span>
				</div>
			);
		},
	},
];
