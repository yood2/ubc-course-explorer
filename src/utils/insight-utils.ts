import { InsightError, InsightResult } from "../controller/IInsightFacade";
import { Row } from "../controller/InsightFacade.types";
import * as fs from "fs-extra";

export async function loadDataset(datasetID: string): Promise<Row[]> {
	const filename = removeForbiddenCharacters(datasetID);
	const data = await fs.readFile(`./data/${filename}.json`, "utf-8");
	const dataset: unknown = JSON.parse(data);
	validateDataset(dataset);
	const datasetObject = dataset as { sections: Row[] };

	const rows = datasetObject.sections;

	return rows;
}

export function sortResult(order: string, result: InsightResult[]): InsightResult[] {
	result.sort((a: InsightResult, b: InsightResult) => {
		const fieldA = a[order as keyof InsightResult];
		const fieldB = b[order as keyof InsightResult];

		if (typeof fieldA === "number" && typeof fieldB === "number") {
			return fieldA - fieldB;
		}

		if (typeof fieldA === "string" && typeof fieldB === "string") {
			if (fieldA < fieldB) {
				return -1;
			}
			if (fieldA > fieldB) {
				return 1;
			}
			return 0;
		}

		throw new InsightError("order must be a valid field!");
	});
	return result;
}

export function validateDataset(dataset: any): asserts dataset is object {
	if (Array.isArray(dataset)) {
		throw new Error("ValidationError: dataset must be an object not an array.");
	}
	if (!Object.hasOwn(dataset, "sections")) {
		throw new Error("ValidationError: dataset is missing required field 'sections'.");
	}
	if (!Array.isArray(dataset.sections)) {
		throw new Error("ValidationError: sections under dataset must be an array.");
	}
}

export function makeAttribute(datasetID: string, keys: string[], row: Row): InsightResult {
	const attribute: InsightResult = {};

	keys.forEach((key) => {
		attribute[datasetID + "_" + key] = row[key as keyof Row];
	});

	return attribute;
}

// Removes all forbidden characters for a filename from the string
export function removeForbiddenCharacters(filename: string): string {
	// Define forbidden characters
	const forbiddenChars = /[\\/:*?"<>|]/g;

	// Replace all forbidden characters with an empty string
	return filename.replace(forbiddenChars, "");
}
