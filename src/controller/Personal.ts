import { loadDataset, makeAttribute, trimResults } from "../utils/insight-utils";
import { InsightResult } from "./IInsightFacade";
import { Row } from "./InsightFacade.types";

export async function getMetadata(datasetID: string): Promise<InsightResult[]> {
	let result: InsightResult[] = [];
	const rows: Row[] = await loadDataset(datasetID);

	rows.forEach((row) => {
		result.push(makeAttribute(datasetID, row));
	});

	let columns = ["year", "dept", "id"];
	columns = columns.map((column) => datasetID + "_" + column);

	result = trimResults(columns, result);

	return result;
}
