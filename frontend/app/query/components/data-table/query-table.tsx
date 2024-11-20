import { DataTable } from "@/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

interface QueryTableProps {
	data: any[];
}

export function QueryTable({ data }: QueryTableProps) {
	const columns = generateColumns(data);
	return (
		<>
			<DataTable data={data} columns={columns} />
		</>
	);
}

const generateColumns = (data: Record<string, any>[]): ColumnDef<any>[] => {
	if (!data.length) return [];

	const keys = Object.keys(data[0]);

	return keys.map((key) => ({
		accessorKey: key,
		header: ({ column }) => <DataTableColumnHeader column={column} title={key} />,
		cell: ({ row }) => (
			<div className="flex space-x-2">
				<span className="max-w-[500px] truncate font-medium">{row.getValue(key)}</span>
			</div>
		),
	}));
};
