import {
	IInsightFacade,
	InsightError,
	NotFoundError,
	InsightDataset,
	InsightDatasetKind,
	InsightResult,
	ResultTooLargeError,
} from "./IInsightFacade";
import { Section, Query, Where } from "./InsightFacade.types";

import * as fs from "fs-extra";
import { validateQuery, matchQuery, parseOptions } from "../utils/query-utils";
import { addMetadata, readMetadata, removeMetadata, getIds } from "../utils/metadata-utils";
import { loadDataset, makeAttribute, removeForbiddenCharacters } from "../utils/insight-utils";
import { checkId, checkBase64 } from "../utils/validation-utils";

import { DatasetProcessor } from "./DatasetProcessor";

/**
 * Reads and validates a given dataset.
 *
 * @param datasetID containing the dataset id
 * @throws Error if JSON file is not a valid dataset.
 */

export default class InsightFacade implements IInsightFacade {
	/**
	 * Adds a new dataset into the InsightFacade.
	 * 1. Checks id, checks content, checks kind.
	 * 2. Confirms data directions, writes file to path.
	 * 3. Adds meta data to internal model
	 *
	 * @param id - id for dataset to add
	 * @param content - base64 of content to be added
	 * @param kind - kind of dataset (rows, Rooms)
	 * @returns - promise that resolves into string[] of all the added ids
	 */
	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		try {
			// Check for valid id
			checkId(id);
			const ids = await getIds();
			if (ids.includes(id)) {
				throw new InsightError("Id already exists");
			}

			// Check if base64
			checkBase64(content);

			// Validate, parse, process
			const processor = new DatasetProcessor();
			const validated = await processor.validate(content, kind);
			const parsed = await processor.parse(validated, kind);
			const { rows, totalRows } = await processor.process(parsed, kind);

			// Writing
			const fileId = removeForbiddenCharacters(id);
			const filePath = `data/${fileId}.json`;
			await fs.promises.mkdir("data/", { recursive: true });
			await fs.promises.writeFile(filePath, JSON.stringify({ sections: rows }));

			// Add meta data to internal model
			await addMetadata({
				id: id,
				kind: kind,
				numRows: totalRows,
			});

			return await getIds();
		} catch (err) {
			throw new InsightError(`addDataset threw unexpected error: ${err}`);
		}
	}

	/**
	 * Removes dataset from InsightFacade given a id
	 * 1. Check id exists in InsightFacade
	 * 2. Remove dataset with same fileId
	 *
	 * @param id - id of dataset to be removed
	 * @returns - Promise that resolves to the id of the dataset that was removed
	 */
	public async removeDataset(id: string): Promise<string> {
		try {
			// Check id
			checkId(id);
			const ids = await getIds();
			if (!ids.includes(id)) {
				throw new NotFoundError("id not found");
			}

			// Find fileId and remove file from local
			const fileId = removeForbiddenCharacters(id);
			await fs.remove(`data/${fileId}.json`);

			// Remove metadata from InsightFacade
			await removeMetadata(id);
		} catch (err) {
			if (err instanceof NotFoundError) {
				throw new NotFoundError(`removeDataset threw unexpected error: ${err.message}`);
			} else {
				throw new InsightError(`removeDataset threw unexpected error: ${err}`);
			}
		}

		// Return id of removed dataset
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

		const rows: Section[] = await loadDataset(datasetID, order);

		// base case when WHERE is empty
		if (Object.keys(input.WHERE).length === 0) {
			rows.forEach((section) => {
				result.push(makeAttribute(datasetID, keys, section));
			});
			return result;
		}

		const where: Where = input.WHERE as Where;

		// need to filter attributes
		rows.forEach((section) => {
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

	/**
	 * List all datasets added to InsightFacade
	 *
	 * @returns - InsightDataset[] with all datasets added
	 */
	public async listDatasets(): Promise<InsightDataset[]> {
		return readMetadata();
	}
}
