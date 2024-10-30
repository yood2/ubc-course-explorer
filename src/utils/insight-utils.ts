import Decimal from "decimal.js";
import { InsightResult } from "../controller/IInsightFacade";
import { Row } from "../controller/InsightFacade.types";
import * as fs from "fs-extra";

export async function loadDataset(datasetID: string): Promise<Row[]> {
	const filename = removeForbiddenCharacters(datasetID);
	const data = await fs.readFile(`./data/${filename}.json`, "utf-8");
	const dataset: unknown = JSON.parse(data);

	validateDataset(dataset);

	const datasetObject = dataset as { rows: Row[] };
	const rows = datasetObject.rows;

	return rows;
}

export function performTransformations(transformations: any, result: InsightResult[]): InsightResult[] {
	const group = transformations.GROUP;
	const apply = transformations.APPLY;

	const groupedResult = performGrouping(group, result);
	const finalResult = performApply(apply, groupedResult);
	return finalResult;
}

function performGrouping(group: string[], result: InsightResult[]): Record<string, any[]> {
	const groupedResult: Record<string, any[]> = {};

	result.forEach((item) => {
		// Generate a key for each group based on the values in 'group'
		const groupKey = group.map((key) => item[key]).join("__");

		// Initialize the group if it doesn't exist
		if (!groupedResult[groupKey]) {
			groupedResult[groupKey] = [];
		}

		// Add the current item to the corresponding group
		groupedResult[groupKey].push(item);
	});

	return groupedResult;
}

function performApply(apply: any[], groupedResult: Record<string, any[]>): InsightResult[] {
	const result: InsightResult[] = [];
	if (apply.length === 0) {
		// nothing to apply
		for (const key in groupedResult) {
			result.push(groupedResult[key][0]);
		}
	} else {
		// loop through all groups
		for (const key in groupedResult) {
			let applyResults = initializeApply(apply, groupedResult[key][0]);
			const groupArray = groupedResult[key];
			// loop through all rows in group
			for (const row of groupArray) {
				applyResults = applyTokens(row, applyResults);
			}
			applyResults = finalizeTokens(applyResults);
			result.push(parseApplyResults(applyResults, groupedResult[key][0]));
		}
	}
	return result;
}

function parseApplyResults(applyResults: any[], row: InsightResult): InsightResult {
	applyResults.forEach((apply) => {
		row[apply.name] = apply.total;
	});
	return row;
}

// applies token (MAX, MIN, etc.) to a row in a group
function applyTokens(row: InsightResult, applyResults: any[]): any[] {
	applyResults.forEach((apply) => {
		switch (apply.token) {
			case "MAX":
				apply.total = Math.max(apply.total, row[apply.attribute] as number);
				break;
			case "MIN":
				apply.total = Math.min(apply.total, row[apply.attribute] as number);
				break;
			case "AVG": {
				const curVal = new Decimal(apply.total);
				const val = new Decimal(row[apply.attribute]);
				apply.total = curVal.add(val);
				break;
			}
			case "COUNT": {
				apply.uniqueVals.add(row[apply.attribute]);
				break;
			}
			case "SUM": {
				const curVal = new Decimal(apply.total);
				apply.total = curVal.add(row[apply.attribute]);
				break;
			}
			default:
				break;
		}
		apply.count += 1;
	});
	return applyResults;
}

// finalizes the results in apply
function finalizeTokens(applyResults: any[]): any[] {
	const two = 2;
	applyResults.forEach((apply) => {
		switch (apply.token) {
			case "COUNT":
				apply.total = apply.uniqueVals.size;
				break;
			case "AVG":
				apply.total = apply.total.toNumber() / apply.count;
				apply.total = Number(apply.total.toFixed(two));
				break;
			case "SUM":
				apply.total = Number(apply.total.toFixed(two));
				break;
			default:
				break;
		}
	});
	return applyResults;
}

// intializes apply
function initializeApply(apply: any[], row: InsightResult): any[] {
	const result: any[] = [];

	apply.forEach((applyRule) => {
		const applyKey = Object.keys(applyRule)[0];
		const ruleDefinition = applyRule[applyKey];
		const attribute = ruleDefinition[Object.keys(ruleDefinition)[0]];
		const token = Object.keys(ruleDefinition)[0];

		const applyVal: any = {};
		applyVal.name = applyKey;
		applyVal.token = token;
		applyVal.attribute = attribute;
		applyVal.total = 0;
		applyVal.count = 0;
		applyVal.uniqueVals = new Set<number | string>();

		if (applyVal.token === "MAX" || applyVal.token === "MIN") {
			applyVal.total = row[applyVal.attribute];
		}
		result.push(applyVal);
	});
	return result;
}

export function sortResult(orderOption: any, result: InsightResult[]): InsightResult[] {
	let order = { dir: "", keys: [""] };

	if (typeof orderOption === "string") {
		order.dir = "UP";
		order.keys[0] = orderOption;
	} else {
		order = orderOption;
	}

	if (order.dir === "UP") {
		return sortUp(order.keys, result);
	} else {
		return sortDown(order.keys, result);
	}
}

function sortUp(keys: string[], result: InsightResult[]): InsightResult[] {
	result.sort((a: InsightResult, b: InsightResult) => {
		for (const order of keys) {
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
			}
		}
		return 0;
	});
	return result;
}

function sortDown(keys: string[], result: InsightResult[]): InsightResult[] {
	result.sort((a: InsightResult, b: InsightResult) => {
		for (const order of keys) {
			const fieldA = a[order as keyof InsightResult];
			const fieldB = b[order as keyof InsightResult];

			if (typeof fieldA === "number" && typeof fieldB === "number") {
				return fieldB - fieldA;
			}

			if (typeof fieldA === "string" && typeof fieldB === "string") {
				if (fieldA > fieldB) {
					return -1;
				}
				if (fieldA < fieldB) {
					return 1;
				}
			}
		}
		return 0;
	});
	return result;
}

export function validateDataset(dataset: any): asserts dataset is object {
	if (Array.isArray(dataset)) {
		throw new Error("ValidationError: dataset must be an object not an array.");
	}
	if (!Object.hasOwn(dataset, "rows")) {
		throw new Error("ValidationError: dataset is missing required field 'rows.");
	}
	if (!Array.isArray(dataset.rows)) {
		throw new Error("ValidationError: rows under dataset must be an array.");
	}
}

export function makeAttribute(datasetID: string, row: Row): InsightResult {
	const attribute: InsightResult = {};

	for (const key in row) {
		attribute[datasetID + "_" + key] = row[key as keyof Row];
	}

	return attribute;
}

export function trimResults(columns: string[], result: InsightResult[]): InsightResult[] {
	const finalResult = [];
	for (const row of result) {
		const attribute: InsightResult = {};
		for (const key of columns) {
			attribute[key] = row[key];
		}
		finalResult.push(attribute);
	}
	return finalResult;
}

// Removes all forbidden characters for a filename from the string
export function removeForbiddenCharacters(filename: string): string {
	// Define forbidden characters
	const forbiddenChars = /[\\/:*?"<>|]/g;

	// Replace all forbidden characters with an empty string
	return filename.replace(forbiddenChars, "");
}
