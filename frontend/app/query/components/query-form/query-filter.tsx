import { useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface QueryFilterProps {
	selectedOrder: string;
	filters: {};
	setFilters: React.Dispatch<React.SetStateAction<string[]>>;
}

export function QueryFilter({ selectedOrder, filters, setFilters }: QueryFilterProps) {
	const [input, setInput] = useState<string | null>(null);

	const initializeInput = () => {
		setInput(JSON.stringify(filters, null, 2));
	};

	const handleConfirm = () => {
		try {
			if (input !== null) {
				const parsedFilters = JSON.parse(input);
				if (typeof parsedFilters !== "object" || Array.isArray(parsedFilters)) {
					alert("Filters must be a valid JSON object.");
					return;
				}

				setFilters(parsedFilters);
			}
		} catch (error) {
			alert("Invalid JSON. Please check your input.");
		}
	};

	return (
		<>
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline" disabled={selectedOrder === ""} onClick={initializeInput}>
						Custom Filters
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Custom Filters</DialogTitle>
						<DialogDescription>Enter custom filters in JSON below.</DialogDescription>

						{input !== null && (
							<Textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder='{"GT": {"key": value}}'
								rows={8}
							/>
						)}

						<Button onClick={handleConfirm} className="mt-4">
							Confirm
						</Button>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		</>
	);
}
