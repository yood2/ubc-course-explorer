import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { removeDataset } from "@/app/utils/api-utils";
import { useInsightContext } from "@/context/context";

interface DataTableRowActionsProps<TData> {
	row: Row<TData>;
}

interface InsightDataset {
	id: string;
	kind: string;
	numRows: number;
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
	const { reloadDatasets } = useInsightContext();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleRemove = async () => {
		const id = (row.original as InsightDataset).id;
		try {
			const { result, error } = await removeDataset(id);
			if (error) {
				alert(`Failed to remove dataset id ${id}: ${error}`);
			} else {
				alert(`${id} was successfully removed.`);
				reloadDatasets();
			}
			setIsDialogOpen(false); // Close the dialog after removing
		} catch (e) {
			alert(`Error`);
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
						<MoreHorizontal />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-[160px]">
					<DropdownMenuItem onClick={() => setIsDialogOpen(true)}>Remove</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Dialog is separated from DropdownMenu */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="w-[300px]">
					<DialogHeader>
						<DialogTitle>Removing Dataset</DialogTitle>
					</DialogHeader>
					<DialogDescription>
						Are you sure you want to remove dataset "{(row.original as InsightDataset).id}"?"
					</DialogDescription>
					<Button onClick={handleRemove}>Confirm</Button>
				</DialogContent>
			</Dialog>
		</>
	);
}
