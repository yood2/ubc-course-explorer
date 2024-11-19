"use client";

import { createContext, useState, useEffect, useContext } from "react";

interface InsightContextType {
	datasets: InsightDataset[];
	setDatasets: (datasets: InsightDataset[]) => void;
	queryResults: any[];
	setQueryResults: (results: any) => void;
	reloadDatasets: () => Promise<void>;
}

enum InsightDatasetKind {
	Sections = "sections",
	Rooms = "rooms",
}

interface InsightDataset {
	id: string;
	kind: InsightDatasetKind;
	numRows: number;
}

const InsightContext = createContext<InsightContextType | undefined>(undefined);

export const InsightProvider = ({ children }: any) => {
	const [datasets, setDatasets] = useState<InsightDataset[]>([]);
	const [queryResults, setQueryResults] = useState([]);

	const loadDatasets = async () => {
		try {
			const { result, error } = await listDatasets();
			if (error) {
				console.error("Error loading datasets:", error);
				return;
			}
			setDatasets(result || []);
		} catch (err) {
			console.error("Error fetching datasets:", err);
		}
	};

	useEffect(() => {
		loadDatasets();
	}, []);

	return (
		<InsightContext.Provider
			value={{ datasets, setDatasets, queryResults, setQueryResults, reloadDatasets: loadDatasets }}
		>
			{children}
		</InsightContext.Provider>
	);
};

export const useInsightContext = () => {
	const context = useContext(InsightContext);

	if (!context) {
		throw new Error("useDatasetContext must be used within a DatasetProvider");
	}

	return context;
};

async function listDatasets() {
	const response = await fetch(`http://localhost:4321/datasets`, {
		method: "GET",
	});

	if (response.ok) {
		const result = await response.json();
		return { result: result.result };
	} else {
		const error = await response.json();
		return { error: error.error || "An error occurred while listing datasets" };
	}
}
