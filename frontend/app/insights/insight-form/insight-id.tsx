"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface InsightIdProps {
	selectedDept: string;
	ids: string[];
	selectedId: string;
	setSelectedId: React.Dispatch<React.SetStateAction<string>>;
}

export function InsightId({ selectedDept, ids, selectedId, setSelectedId }: InsightIdProps) {
	const [open, setOpen] = React.useState(false); // Popover open/close state
	const [searchTerm, setSearchTerm] = React.useState(""); // For filtering datasets

	const filteredIds = ids.filter((id: string) => id.toLowerCase().includes(searchTerm.trim().toLowerCase()));

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					disabled={selectedDept === ""}
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[200px] justify-between"
				>
					{selectedId || "Select id..."}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput
						placeholder="Search id..."
						value={searchTerm}
						onInput={(e) => setSearchTerm(e.currentTarget.value)}
					/>
					<CommandList>
						{ids.length === 0 && <CommandEmpty>No year found.</CommandEmpty>}
						<CommandGroup>
							{ids.map((id: string) => (
								<CommandItem
									key={id}
									value={id}
									onSelect={(currentValue) => {
										setSelectedId(currentValue === selectedId ? "" : currentValue);
										setOpen(false);
									}}
								>
									<Check className={cn("mr-2 h-4 w-4", selectedId === id ? "opacity-100" : "opacity-0")} />
									{id}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
