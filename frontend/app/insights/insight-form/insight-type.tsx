"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface InsightTypeProps {
	selectedType: string;
	setSelectedType: React.Dispatch<React.SetStateAction<string>>;
}

const options = ["pass/fail", "audit participation"];

export function InsightType({ selectedType, setSelectedType }: InsightTypeProps) {
	const [open, setOpen] = React.useState(false); // Popover open/close state
	const [searchTerm, setSearchTerm] = React.useState(""); // For filtering datasets

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
					{selectedType || "Select option..."}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput
						placeholder="Search option..."
						value={searchTerm}
						onInput={(e) => setSearchTerm(e.currentTarget.value)}
					/>
					<CommandList>
						{options.length === 0 && <CommandEmpty>No year found.</CommandEmpty>}
						<CommandGroup>
							{options.map((option: string) => (
								<CommandItem
									key={option}
									value={option} // Ensure value is a string
									onSelect={(currentValue) => {
										setSelectedType(currentValue === selectedType ? "" : currentValue);
										setOpen(false);
									}}
								>
									<Check className={cn("mr-2 h-4 w-4", selectedType === option ? "opacity-100" : "opacity-0")} />
									{option}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
