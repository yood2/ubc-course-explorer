"use client";

import { createContext, useState, useContext } from "react";
import { InsightDataset } from "@/types/schema";

interface InsightContextType {
	datasets: InsightDataset[];
	setDatasets: (datasets: InsightDataset[]) => void;
	queryResults: any[];
	setQueryResults: (results: any) => void;
}

const InsightContext = createContext<InsightContextType | undefined>(undefined);

export const InsightProvider = ({ children }: any) => {
	const [datasets, setDatasets] = useState<InsightDataset[]>([]);
	const [queryResults, setQueryResults] = useState([]);

	return (
		<InsightContext.Provider value={{ datasets, setDatasets, queryResults, setQueryResults }}>
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
