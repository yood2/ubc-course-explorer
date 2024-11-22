"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface InsightDeptProps {
	selectedYear: number;
	depts: string[];
	selectedDept: string;
	setSelectedDept: React.Dispatch<React.SetStateAction<string>>;
}

export function InsightDept({ selectedYear, depts, selectedDept, setSelectedDept }: InsightDeptProps) {
	const [open, setOpen] = React.useState(false);
	const [searchTerm, setSearchTerm] = React.useState("");

	const filteredDepts = React.useMemo(() => {
		if (!searchTerm) return depts;
		return depts.filter((dept) => dept.toLowerCase().includes(searchTerm.toLowerCase()));
	}, [depts, searchTerm]);

	const handleSelect = React.useCallback(
		(currentValue: string) => {
			setSelectedDept(currentValue === selectedDept ? "" : currentValue);
			setOpen(false);
		},
		[selectedDept, setSelectedDept]
	);

	const TriggerButton = React.useMemo(
		() => (
			<Button
				disabled={selectedYear === 0}
				variant="outline"
				role="combobox"
				aria-expanded={open}
				className="w-[200px] justify-between"
			>
				{selectedDept || "Select dept..."}
				<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		),
		[open, selectedYear, selectedDept]
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput
						placeholder="Search dept..."
						value={searchTerm}
						onInput={(e) => setSearchTerm(e.currentTarget.value)}
					/>
					<CommandList>
						{filteredDepts.length === 0 && <CommandEmpty>No departments found.</CommandEmpty>}
						<CommandGroup>
							{filteredDepts.map((dept) => (
								<CommandItem key={dept} value={dept} onSelect={handleSelect} aria-selected={selectedDept === dept}>
									<Check className={cn("mr-2 h-4 w-4", selectedDept === dept ? "opacity-100" : "opacity-0")} />
									{dept}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
