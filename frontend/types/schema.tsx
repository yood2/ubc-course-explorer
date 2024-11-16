export enum InsightDatasetKind {
	Sections = "sections",
	Rooms = "rooms",
}

export interface InsightDataset {
	id: string;
	kind: InsightDatasetKind;
	numRows: number;
}
