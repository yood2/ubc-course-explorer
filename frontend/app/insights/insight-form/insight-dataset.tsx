"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useInsightContext } from "@/context/context";

interface QueryDatasetProps {
	selectedDataset: string;
	setSelectedDataset: React.Dispatch<React.SetStateAction<string>>;
}

export function InsightDataset({ selectedDataset, setSelectedDataset }: QueryDatasetProps) {
	const [open, setOpen] = React.useState(false); // popover open/close state
	const [searchTerm, setSearchTerm] = React.useState(""); // for filtering datasets
	const { datasets } = useInsightContext(); // list of datasets from context

	const ids = datasets.map((dataset) => dataset.id);

	const filteredDatasets = ids.filter((id) => id.includes(searchTerm));

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
					{selectedDataset || "Select dataset..."}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput
						placeholder="Search dataset..."
						value={searchTerm}
						onInput={(e) => setSearchTerm(e.currentTarget.value)}
					/>
					<CommandList>
						<CommandEmpty>No dataset found.</CommandEmpty>
						<CommandGroup>
							{filteredDatasets.map((dataset) => (
								<CommandItem
									key={dataset}
									value={dataset}
									onSelect={(currentValue) => {
										setSelectedDataset(currentValue === selectedDataset ? "" : currentValue);
										setOpen(false);
									}}
								>
									<Check className={cn("mr-2 h-4 w-4", selectedDataset === dataset ? "opacity-100" : "opacity-0")} />
									{dataset}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
