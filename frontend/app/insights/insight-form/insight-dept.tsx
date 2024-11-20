"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { courses } from "./courses_by_dept";

interface InsightDeptProps {
	selectedDept: string;
	setSelectedDept: React.Dispatch<React.SetStateAction<string>>;
}

export function InsightDept({ selectedDept, setSelectedDept }: InsightDeptProps) {
	const [open, setOpen] = React.useState(false); // Popover open/close state
	const [searchTerm, setSearchTerm] = React.useState(""); // For filtering datasets

	const depts = Object.keys(courses);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
					{selectedDept || "Select dept..."}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput
						placeholder="Search dept..."
						value={searchTerm}
						onInput={(e) => setSearchTerm(e.currentTarget.value)}
					/>
					<CommandList>
						{depts.length === 0 && <CommandEmpty>No year found.</CommandEmpty>}
						<CommandGroup>
							{depts.map((dept) => (
								<CommandItem
									key={dept}
									value={dept} // Ensure value is a string
									onSelect={(currentValue) => {
										setSelectedDept(currentValue === selectedDept ? "" : currentValue);
										setOpen(false);
									}}
								>
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
