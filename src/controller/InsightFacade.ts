import {
	IInsightFacade,
	InsightError,
	NotFoundError,
	InsightDataset,
	InsightDatasetKind,
	InsightResult,
	ResultTooLargeError,
} from "./IInsightFacade";
import * as fs from "fs-extra";
import { processZipContent } from "./ZipUtil";
import { validateQuery, matchQuery, parseOptions } from "./QueryUtil";
import { addMetadata, readMetadata, removeMetadata, getIds } from "./MetaUtil";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

// changing something

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

export type Where = Record<string, any>;

/**
 * Reads and validates a given dataset.
 *
 * @param datasetID containing the dataset id
 * @throws Error if JSON file is not a valid dataset.
 */
async function loadDataset(datasetID: string, order: string): Promise<Section[]> {
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

function makeAttribute(datasetID: string, keys: string[], section: Section): InsightResult {
	const attribute: InsightResult = {};

	keys.forEach((key) => {
		attribute[datasetID + "_" + key] = section[key as keyof Section];
	});

	return attribute;
}

// Removes all forbidden characters for a filename from the string
function removeForbiddenCharacters(filename: string): string {
	// Define forbidden characters
	const forbiddenChars = /[\\/:*?"<>|]/g;

	// Replace all forbidden characters with an empty string
	return filename.replace(forbiddenChars, "");
}

export default class InsightFacade implements IInsightFacade {
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
			const ids = await getIds();
			if (ids.includes(id)) {
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
				id: id,
				kind: kind,
				numRows: totalRows,
			};

			await addMetadata(dataset);
		} catch (err) {
			if (err instanceof InsightError) {
				throw err;
			}
			throw new InsightError(`addDataset threw unexpected error: ${err}`);
		}
		const metaData = await readMetadata();
		const result: string[] = [];

		for (const data of metaData) {
			result.push(data.id);
		}

		return result;
	}

	public async removeDataset(id: string): Promise<string> {
		try {
			// id validity checks
			this.checkId(id);

			const ids = await getIds();

			if (!ids.includes(id)) {
				throw new NotFoundError("id not found");
			}

			await fs.remove(`data/${id}.json`);
			await removeMetadata(id);
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
		const order = options.order;
		const columns = options.columns;
		const keys: string[] = columns.map((col: string) => col.split("_")[1]);
		const datasetID = options.datasetID;

		const sections: Section[] = await loadDataset(datasetID, order);

		// base case when WHERE is empty
		if (Object.keys(input.WHERE).length === 0) {
			sections.forEach((section) => {
				result.push(makeAttribute(datasetID, keys, section));
			});
			return result;
		}

		const where: Where = input.WHERE as Where;

		// need to filter attributes
		sections.forEach((section) => {
			if (matchQuery(where, section, datasetID)) {
				result.push(makeAttribute(datasetID, keys, section));
			}
		});

		const max = 5000;

		if (result.length > max) {
			throw new ResultTooLargeError("Result can not be over 5000");
		}

		return result;
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		return readMetadata();
	}
}
