import {
	IInsightFacade,
	InsightError,
	NotFoundError,
	InsightDataset,
	InsightDatasetKind,
	InsightResult,
} from "./IInsightFacade";
import * as fs from "fs-extra";
import { processZipContent } from "./ZipUtil";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

export interface Section {
	uuid: string;
	id: string;
	title: string;
	instructor: string;
	dept: string;
	year: number;
	avg: number;
	pass: number;
	fail: number;
	audit: number;
}

export interface Query {
	WHERE: object;

	OPTIONS: {
		COLUMNS: string[];
		ORDER?: string;
	};
}

const mfields: string[] = ["avg", "pass", "fail", "audit", "year"];
const sfields: string[] = ["dept", "id", "instructor", "title", "uuid"];

/**
 * Checks if columns is valid
 *
 * @param columns refers to columns field in given query
 * @throws Error if columns is not valid
 */
function validateColumns(columns: string[]): void {
	if (!Array.isArray(columns) || columns.some((col) => typeof col !== "string") || columns.length === 0) {
		throw new InsightError("COLUMNS must be an array of strings and not empty.");
	}

	// make sure datasetID exists
	const datasetID: string = columns[0].split("_")[0];
	if (datasetID === "") {
		throw new InsightError("Dataset ID must exist in query");
	}

	// check if COLUMNS only contains valid keys
	columns.forEach((col) => {
		const colParts = col.split("_");
		const two = 2;

		// make sure order has exactly one underscore
		if (colParts.length !== two) {
			throw new InsightError("Dataset ID can only have one underscore");
		}

		const curDatasetID: string = colParts[0];

		if (datasetID !== curDatasetID) {
			throw new InsightError("Query can only reference one dataset");
		}

		const key: string = colParts[1];
		if (!mfields.includes(key) && !sfields.includes(key)) {
			throw new InsightError("COLUMNS must only contain valid mfield or sfield keys");
		}
	});
}

/**
 * Checks if query is valid
 *
 * @param query refers to given query
 * @throws Error if query is not valid
 */
function validateQuery(query: any): asserts query is Query {
	// check if query exists:
	if (query === null || typeof query !== "object") {
		throw new InsightError("Query has to be an object!");
	}

	const input = query as Query;

	// check if WHERE exists
	if (!Object.hasOwn(input, "WHERE")) {
		throw new InsightError("query is missing required field 'WHERE'.");
	}

	// check if OPTIONS exist
	if (!Object.hasOwn(input, "OPTIONS")) {
		throw new InsightError("query is missing required field 'OPTIONS'.");
	}

	// check if COLUMNS exist under OPTIONS
	if (!Object.hasOwn(input.OPTIONS, "COLUMNS")) {
		throw new InsightError("OPTIONS is missing required field 'COLUMNS'.");
	}

	// Check if COLUMNS is an array of strings that is NOT empty
	const columns = input.OPTIONS.COLUMNS;
	validateColumns(columns);

	const datasetID: string = columns[0].split("_")[0];

	// Check if ORDER exists, and if it does, check if it is a string
	if ("ORDER" in input.OPTIONS) {
		// check if order is a string
		if (typeof input.OPTIONS.ORDER !== "string") {
			throw new InsightError("ORDER must be a string.");
		}

		const orderParts = input.OPTIONS.ORDER.split("_");
		const two = 2;

		// make sure order has exactly one underscore
		if (orderParts.length !== two) {
			throw new InsightError("Dataset ID can only have one underscore");
		}
		const order: string = orderParts[1];

		// check if order references a different dataset
		if (datasetID !== orderParts[0]) {
			throw new InsightError("ORDER referenced a different dataset!");
		}
		if (!mfields.includes(order)) {
			// check if order is an mfield
			throw new InsightError("ORDER must be a valid mfield key.");
		}
	}
}

function parseOptions(options: any): Record<string, any> {
	const columns = options.COLUMNS as string[];
	let order = "";

	if ("ORDER" in options) {
		order = options.ORDER as string;
		order = order.split("_")[1];
	}

	return {
		order: order,
		columns: columns,
		datasetID: columns[0].split("_")[0],
	};
}

/**
 * Reads and validates a given dataset.
 *
 * @param datasetID containing the dataset id
 * @throws Error if JSON file is not a valid dataset.
 */
async function loadDataset(datasetID: string): Promise<Section[]> {
	const filename = removeForbiddenCharacters(datasetID);
	const data = await fs.readFile(`./data/${filename}.json`, "utf-8");
	const dataset: unknown = JSON.parse(data);
	validateDataset(dataset);
	const datasetObject = dataset as { sections: Section[] };
	return datasetObject.sections;
}

function validateDataset(dataset: any): asserts dataset is object {
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

// Removes all forbidden characters for a filename from the string
function removeForbiddenCharacters(filename: string): string {
	// Define forbidden characters
	const forbiddenChars = /[\\/:*?"<>|]/g;

	// Replace all forbidden characters with an empty string
	return filename.replace(forbiddenChars, "");
}

export default class InsightFacade implements IInsightFacade {
	private ids: string[];
	private metadata: InsightDataset[];

	constructor() {
		this.ids = [];
		this.metadata = [];
	}

	public checkId(id: string): boolean {
		// id validity checks
		id = removeForbiddenCharacters(id);
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

	public isBase64(str: string): boolean {
		if (str === "" || str.trim() === "") {
			return false;
		}
		// Check if the string only contains valid base64 characters
		return /^[A-Za-z0-9+/]*={0,2}$/.test(str) && btoa(atob(str)) === str;
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		try {
			this.checkId(id);
			if (this.ids.includes(id)) {
				throw new InsightError("Id already exists");
			}

			if (kind === "rooms") {
				throw new InsightError("Incorrect InsightDatasetKind");
			}

			const { sections, totalRows } = await processZipContent(content);

			const output = { sections };

			await fs.promises.mkdir("data/", { recursive: true });
			const filePath = `data/${id}.json`;
			await fs.promises.writeFile(filePath, JSON.stringify(output));

			const dataset: InsightDataset = {
				id,
				kind,
				numRows: totalRows,
			};

			this.metadata.push(dataset);
			this.ids.push(id);

			return this.ids;
		} catch (err) {
			if (err instanceof InsightError) {
				throw err;
			}
			throw new InsightError(`addDataset threw unexpected error: ${err}`);
		}
	}

	public async removeDataset(id: string): Promise<string> {
		try {
			// id validity checks
			this.checkId(id);

			if (!this.ids.includes(id)) {
				throw new NotFoundError("id not found");
			}

			await fs.remove(`data/${id}.json`);

			const indexToRemove = this.ids.indexOf(id);
			this.ids.splice(indexToRemove, 1);
		} catch (err) {
			if (err instanceof NotFoundError) {
				throw err;
			} else {
				throw new InsightError(`removeDataset threw unexpected error: ${err}`);
			}
		}

		return id;
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		// validate query, throw InsightError if query is not valid
		validateQuery(query);

		const input: Query = query as Query;

		const result: InsightResult[] = [];

		const options = parseOptions(input.OPTIONS);
		// const order = options.order;
		const columns = options.columns;
		const keys: string[] = columns.map((col: string) => col.split("_")[1]);
		const datasetID = options.datasetID;

		const sections: Section[] = await loadDataset(datasetID);

		// base case when WHERE is empty
		if (Object.keys(input.WHERE).length === 0) {
			sections.forEach((section) => {
				const attribute: InsightResult = {};
				keys.forEach((key) => {
					attribute[datasetID + "_" + key] = section[key as keyof Section];
				});
				result.push(attribute);
			});
		}

		return result;
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		return this.metadata;
	}

	/*
		Todos:
			- if order exists, first sort sections before adding to result
			- get some EBNF logic working
	*/
}
