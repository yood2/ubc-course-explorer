"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface QueryOrderProps {
	selectedColumns: string[];
	selectedOrder: string;
	setSelectedOrder: React.Dispatch<React.SetStateAction<string>>;
}

export function QueryOrder({ selectedColumns, selectedOrder, setSelectedOrder }: QueryOrderProps) {
	const [open, setOpen] = useState<boolean>(false);

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="w-[200px] justify-between"
						disabled={selectedColumns.length === 0}
					>
						{selectedOrder ? selectedColumns.find((column) => column === selectedOrder) : "Order by..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0">
					<Command>
						<CommandInput placeholder="Search framework..." />
						<CommandList>
							<CommandEmpty>No framework found.</CommandEmpty>
							<CommandGroup>
								{selectedColumns.map((column) => (
									<CommandItem
										key={column}
										value={column}
										onSelect={(currentValue) => {
											setSelectedOrder(currentValue === selectedOrder ? "" : currentValue);
											setOpen(false);
										}}
									>
										<Check className={cn("mr-2 h-4 w-4", selectedOrder === column ? "opacity-100" : "opacity-0")} />
										{column}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</>
	);
}
