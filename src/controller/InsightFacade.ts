import {
	IInsightFacade,
	InsightError,
	NotFoundError,
	InsightDataset,
	InsightDatasetKind,
	InsightResult,
	ResultTooLargeError,
} from "./IInsightFacade";
import { Row, Query, Where, ParsedData } from "./InsightFacade.types";
// import { Row, Query, Where } from "./InsightFacade.types";

import * as fs from "fs-extra";
import { QueryEngine } from "./QueryEngine";
import { addMetadata, readMetadata, removeMetadata, getIds } from "../utils/metadata-utils";
import {
	loadDataset,
	makeAttribute,
	performTransformations,
	removeForbiddenCharacters,
	sortResult,
	trimResults,
} from "../utils/insight-utils";
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
	 * 1. Checks id, checks content
	 * 2. Validate, parse, process
	 * 3. Write file and metadata
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

			// Parse, validate, process
			const processor = new DatasetProcessor();
			const parsed: ParsedData = await processor.parse(content, kind);
			await processor.validate(parsed, kind);
			const { rows, totalRows } = await processor.process(parsed, kind);

			// Writing
			const fileId = removeForbiddenCharacters(id);
			const filePath = `data/${fileId}.json`;
			await fs.promises.mkdir("data/", { recursive: true });
			await fs.promises.writeFile(filePath, JSON.stringify({ rows: rows }));

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

			return id;
		} catch (err) {
			if (err instanceof NotFoundError) {
				throw new NotFoundError(`removeDataset threw unexpected error: ${err.message}`);
			} else {
				throw new InsightError(`removeDataset threw unexpected error: ${err}`);
			}
		}
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		// Create new QueryUtil instance
		const queryUtil = new QueryEngine(query);

		const input: Query = query as Query;

		const transformations = queryUtil.parseTransformations(input);
		const result: InsightResult[] = [];
		const options = queryUtil.parseOptions(input.OPTIONS);
		// const keys: string[] = options.columns.map((col: string) => col.split("_")[1]);
		const datasetID = options.datasetID;
		const where: Where = input.WHERE as Where;

		const rows: Row[] = await loadDataset(datasetID);

		// base case when WHERE is empty
		if (Object.keys(input.WHERE).length === 0) {
			rows.forEach((row) => {
				result.push(makeAttribute(datasetID, row));
			});
		} else {
			rows.forEach((row) => {
				if (queryUtil.matchQuery(where, row)) {
					result.push(makeAttribute(datasetID, row));
				}
			});
		}

		let finalResult: InsightResult[] = result;

		// apply transformations if TRANSOFRMATIONS exist
		if (Object.keys(transformations).length !== 0) {
			finalResult = performTransformations(transformations, finalResult);
		}

		// check if it exceeds 5000 results
		const max = 5000;
		if (finalResult.length > max) {
			throw new ResultTooLargeError("Result can not be over 5000");
		}

		// sort if ORDER exists
		if (options.order !== "") {
			finalResult = sortResult(options.order, finalResult);
		}

		// trim results to only contain keys from columns
		finalResult = trimResults(options.columns, finalResult);

		return finalResult;
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
