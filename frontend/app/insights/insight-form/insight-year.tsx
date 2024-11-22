"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface InsightYearProps {
	selectedDataset: string;
	years: number[];
	selectedYear: number;
	setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
}

export function InsightYear({ selectedDataset, years, selectedYear, setSelectedYear }: InsightYearProps) {
	const [open, setOpen] = React.useState(false);
	const [searchTerm, setSearchTerm] = React.useState("");

	const filteredYears = years.filter((year) => year.toString().includes(searchTerm.trim()));

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					disabled={selectedDataset === ""}
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[200px] justify-between"
				>
					{selectedYear || "Select year..."}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput
						placeholder="Search year..."
						value={searchTerm}
						onInput={(e) => setSearchTerm(e.currentTarget.value)}
					/>
					<CommandList>
						{filteredYears.length === 0 && <CommandEmpty>No year found.</CommandEmpty>}
						<CommandGroup>
							{filteredYears.map((year) => (
								<CommandItem
									key={year}
									value={year.toString()}
									onSelect={(currentValue) => {
										const selectedValue = parseInt(currentValue, 10);
										setSelectedYear(selectedValue === selectedYear ? 0 : selectedValue);
										setOpen(false);
									}}
								>
									<Check className={cn("mr-2 h-4 w-4", selectedYear === year ? "opacity-100" : "opacity-0")} />
									{year}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
