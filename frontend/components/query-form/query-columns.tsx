"use client";

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

interface QueryColumnsProps {
	selectedDataset: string;
	selectedColumns: string[];
	setSelectedColumns: React.Dispatch<React.SetStateAction<string[]>>;
}

export function QueryColumns({ selectedDataset, selectedColumns, setSelectedColumns }: QueryColumnsProps) {
	const options = ["id", "title", "instructor", "dept", "year", "avg", "pass", "fail", "audit"];

	const toggleSelection = (option: string) => {
		setSelectedColumns((prev) =>
			prev.includes(option) ? prev.filter((value) => value !== option) : [...prev, option]
		);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" className="" disabled={selectedDataset === ""}>
					Columns <PlusCircle />
					{selectedColumns.length > 0 && (
						<>
							<Separator orientation="vertical" className="mx-2 h-4" />
							<div className="space-x-1 lg:flex">
								{selectedColumns.map((option) => (
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
							{selectedColumns.length > 0 && (
								<>
									<CommandSeparator />
									<CommandGroup>
										<CommandItem onSelect={() => setSelectedColumns([])} className="justify-center text-center">
											<RotateCcw /> Clear
										</CommandItem>
									</CommandGroup>
								</>
							)}
							{options.map((option) => {
								const isSelected = selectedColumns.includes(option);
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
