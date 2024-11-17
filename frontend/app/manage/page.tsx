"use client";

import AddDataset from "@/components/add-dataset/add-dataset";
import Debug from "@/components/debug/debug";

export default function Home() {
	return (
		<div>
			<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Manage</h3>
			<AddDataset />
		</div>
	);
}
