"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useInsightContext } from "@/context/context";

export default function AddDataset() {
	const { setDatasets } = useInsightContext();
	const [file, setFile] = useState<File | null>(null);
	const [datasetId, setDatasetId] = useState<string>("");
	const [kind, setKind] = useState<string>("sections");

	const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const uploadedFile = event.target.files?.[0];
		if (uploadedFile) {
			setFile(uploadedFile);
		}
	};

	const handleSubmit = async () => {
		if (!datasetId || !file || !kind) {
			alert("Please provide a dataset ID, upload a file, and specify a dataset kind.");
			return;
		}

		try {
			const fileBuffer = await file.arrayBuffer();

			const response = await fetch(`http://localhost:4321/datasets/${datasetId}?kind=${kind}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/octet-stream",
				},
				body: fileBuffer,
			});

			if (response.ok) {
				const result = await response.json();
				setDatasets(result.result);
				alert(`Dataset added successfully: ${JSON.stringify(result)}`);
			} else {
				const error = await response.json();
				alert(`Error: ${error.error}`);
			}
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

			<Label htmlFor="dataset-kind">Dataset Kind</Label>
			<Input
				id="dataset-kind"
				placeholder="Enter Dataset Kind (e.g., sections, rooms)"
				value={kind}
				onChange={(e) => setKind(e.target.value)}
			/>

			<Label htmlFor="dataset">Upload Dataset</Label>
			<Input id="dataset" type="file" onChange={handleUpload} />

			<Button onClick={handleSubmit}>Submit</Button>
		</div>
	);
}
