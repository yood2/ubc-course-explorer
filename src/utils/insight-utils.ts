import { InsightError, InsightDatasetKind, InsightResult } from "../controller/IInsightFacade";
import { Section } from "../controller/InsightFacade.types";
import * as fs from "fs-extra";

export async function loadDataset(datasetID: string, order: string): Promise<Section[]> {
	// if (datasetID in InsightFacade.Sections) {
	// 	return InsightFacade.Sections[datasetID];
	// }

	const filename = removeForbiddenCharacters(datasetID);
	const data = await fs.readFile(`./data/${filename}.json`, "utf-8");
	const dataset: unknown = JSON.parse(data);
	validateDataset(dataset);
	const datasetObject = dataset as { sections: Section[] };

	const sections = datasetObject.sections;

	if (order !== "") {
		sections.sort((a: Section, b: Section) => {
			const fieldA = a[order as keyof Section];
			const fieldB = b[order as keyof Section];

			if (typeof fieldA === "number" && typeof fieldB === "number") {
				return fieldA - fieldB;
			}

			if (typeof fieldA === "string" && typeof fieldB === "string") {
				return fieldA.localeCompare(fieldB);
			}

			throw new InsightError("order must be an mfield!");
		});
	}

	return sections;
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

export function makeAttribute(datasetID: string, keys: string[], section: Section): InsightResult {
	const attribute: InsightResult = {};

	keys.forEach((key) => {
		attribute[datasetID + "_" + key] = section[key as keyof Section];
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

export function checkKind(kind: InsightDatasetKind): void {
	if (kind === "rooms") {
		throw new InsightError("Incorrect InsightDatasetKind");
	}
}

export function checkId(id: string): boolean {
	// id validity checks
	if (id.length === 0) {
		throw new Error("empty id");
	}
	if (id.includes("_")) {
		throw new Error("underscore in id");
	}
	if (/^\s*$/.test(id)) {
		throw new Error("only whitespace in id");
	}
	return true;
}

export function isBase64(str: string): boolean {
	if (str === "" || str.trim() === "") {
		return false;
	}
	return /^[A-Za-z0-9+/]*={0,2}$/.test(str) && btoa(atob(str)) === str;
}
