import * as React from "react";
import { Check, PlusCircle, RotateCcw } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export function QueryOptions() {
	const [selectedValues, setSelectedValues] = useState<string[]>([]);
	const options = [];

	const toggleSelection = (option: string) => {
		setSelectedValues((prev) => (prev.includes(option) ? prev.filter((value) => value !== option) : [...prev, option]));
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" className="h-8">
					<PlusCircle className="mr-2" />
					Options
					{selectedValues.length > 0 && (
						<>
							<Separator orientation="vertical" className="mx-2 h-4" />
							<div className="space-x-1 lg:flex">
								{selectedValues.map((option) => (
									<Badge variant="secondary" key={option} className="rounded-sm px-1 font-normal">
										{option}
									</Badge>
								))}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
				<Command>
					<CommandInput placeholder="Search filters..." />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{selectedValues.length > 0 && (
								<>
									<CommandSeparator />
									<CommandGroup>
										<CommandItem onSelect={() => setSelectedValues([])} className="justify-center text-center">
											<RotateCcw /> Clear
										</CommandItem>
									</CommandGroup>
								</>
							)}
							{options.map((option) => {
								const isSelected = selectedValues.includes(option);
								return (
									<CommandItem key={option} onSelect={() => toggleSelection(option)}>
										<div
											className={cn(
												"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
												isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
											)}
										>
											<Check />
										</div>
										<span>{option}</span>
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
