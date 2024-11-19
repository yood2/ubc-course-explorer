"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "../ui/label";

const filters = ["LT", "GT", "EQ", "IS"];

interface QueryFiltersProps {
	columns: string[];
	setFilters: (filters: Record<string, Record<string, string>>) => void; // Callback to pass queryObject
}

export default function QueryFilters({ columns, setFilters }: QueryFiltersProps) {
	return (
		<div>
			<FilterNode columns={columns} setFilters={setFilters} />
		</div>
	);
}

interface FilterNodeProps {
	columns: string[];
	setFilters: (filters: Record<string, Record<string, string>>) => void;
}

function FilterNode({ columns, setFilters }: FilterNodeProps) {
	const [selectedColumn, setSelectedColumn] = useState<string | null>(null); // Selected column
	const [selectedFilter, setSelectedFilter] = useState<string | null>(null); // Selected filter
	const [inputValue, setInputValue] = useState<string>(""); // Input value
	const [isEditing, setIsEditing] = useState<boolean>(true); // Edit mode

	// Derived object to represent the output
	const queryObject =
		selectedFilter && selectedColumn && inputValue ? { [selectedFilter]: { [selectedColumn]: inputValue } } : null;

	// Call setFilters on "Done"
	const handleDone = () => {
		if (queryObject) {
			setFilters(queryObject);
		}
		setIsEditing(false); // Lock inputs
	};

	// Handle "Cancel" action
	const handleCancel = () => {
		setSelectedColumn(null);
		setSelectedFilter(null);
		setInputValue("");
		setIsEditing(true);
	};

	return (
		<div className="space-y-4">
			{/* Step 1: Select Column */}
			<Label>For column </Label>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" disabled={!isEditing}>
						{selectedColumn || "Select column..."}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56">
					{columns.map((column) => (
						<DropdownMenuItem
							key={column}
							onSelect={() => {
								if (isEditing) {
									setSelectedColumn(column);
									setSelectedFilter(null); // Reset filter when column changes
									setInputValue(""); // Reset input when column changes
								}
							}}
						>
							{column}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Step 2: Select Filter */}
			{selectedColumn && (
				<>
					<Label>, use filter </Label>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" disabled={!isEditing}>
								{selectedFilter || "Select filter..."}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56">
							{filters.map((filter) => (
								<DropdownMenuItem
									key={filter}
									onSelect={() => {
										if (isEditing) setSelectedFilter(filter);
									}}
								>
									{filter}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</>
			)}

			{/* Step 3: Input Field */}
			{selectedFilter && (
				<>
					<Label> for value of </Label>
					<Input
						placeholder="Enter value..."
						value={inputValue}
						onChange={(e) => {
							if (isEditing) setInputValue(e.target.value);
						}}
						className="w-56"
						disabled={!isEditing}
					/>
				</>
			)}

			{/* Buttons: Done and Cancel */}
			{selectedColumn && selectedFilter && inputValue && isEditing && (
				<div className="flex space-x-2 mt-4">
					<Button onClick={handleDone} variant="success">
						Done
					</Button>
				</div>
			)}

			{/* Display the query object (for verification) */}
			{!isEditing && queryObject && (
				<div className="mt-4 p-2 border border-gray-200 rounded bg-gray-50">
					<pre>{JSON.stringify(queryObject, null, 2)}</pre>
				</div>
			)}
		</div>
	);
}
