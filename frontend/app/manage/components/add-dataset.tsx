"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useInsightContext } from "@/context/context";
import { addDataset } from "@/app/utils/api-utils";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

export default function AddDataset() {
	const { reloadDatasets } = useInsightContext();
	const [file, setFile] = useState<File | null>(null);
	const [datasetId, setDatasetId] = useState<string>("");
	const [kind, setKind] = useState<string>("sections");
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const uploadedFile = event.target.files?.[0];
		if (uploadedFile) {
			if (uploadedFile.type === "aplication/zip" || uploadedFile.name.endsWith(".zip")) {
				setFile(uploadedFile);
			} else {
				alert("Please upload valid .zip file.");
				event.target.value = "";
			}
		}
	};

	const handleSubmit = async () => {
		if (!datasetId || !file || !kind) {
			alert("Please provide a dataset ID, upload a file, and specify a dataset kind.");
			return;
		}

		setIsDialogOpen(false);

		try {
			const content = await file.arrayBuffer();
			const res = await addDataset(content, datasetId, kind);
			if (res.error) {
				alert(`${res.error}`);
			} else {
				alert(`Successfully added ${datasetId}`);
			}
			await reloadDatasets();
		} catch (error) {
			console.error("Error submitting dataset:", error);
			alert("An unexpected error occurred.");
		}
	};

	return (
		<div className="grid w-full max-w-sm items-center gap-1.5">
			<Label htmlFor="dataset-id">Dataset ID</Label>
			<Input
				id="dataset-id"
				placeholder="Enter Dataset ID"
				value={datasetId}
				onChange={(e) => setDatasetId(e.target.value)}
			/>

			<Label htmlFor="dataset">Upload Dataset</Label>
			<Input id="dataset" type="file" onChange={handleUpload} />

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogTrigger asChild>
					<Button disabled={file === null || datasetId === ""}>Submit</Button>
				</DialogTrigger>
				<DialogContent className="w-[300px]">
					<DialogHeader>
						<DialogTitle>Adding Dataset</DialogTitle>
					</DialogHeader>
					<DialogDescription>
						Are you sure you want to add dataset "{datasetId}" from "{file?.name}?"
					</DialogDescription>
					<Button onClick={handleSubmit}>Confirm</Button>
				</DialogContent>
			</Dialog>
		</div>
	);
}
