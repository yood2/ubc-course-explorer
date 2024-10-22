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
import { processZipContent } from "../utils/zip-utils";
import { validateQuery, matchQuery, parseOptions } from "../utils/query-utils";
import { addMetadata, readMetadata, removeMetadata, getIds } from "../utils/persistence-utils";
import {
	loadDataset,
	makeAttribute,
	removeForbiddenCharacters,
	checkKind,
	checkId,
	checkBase64,
} from "../utils/insight-utils";

/**
 * Reads and validates a given dataset.
 *
 * @param datasetID containing the dataset id
 * @throws Error if JSON file is not a valid dataset.
 */

export default class InsightFacade implements IInsightFacade {
	// public static Sections: Record<string, Section[]> = {};

	/**
	 * Adds a new dataset into the InsightFacade.
	 * Checks id, checks content, checks kind.
	 *
	 *
	 * @param id - id for dataset to add
	 * @param content - base64 of content to be added
	 * @param kind - kind of dataset (Sections, Rooms)
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

			// Check kind
			checkKind(kind);

			// Gets sections, totalRows, fileID
			const { sections, totalRows } = await processZipContent(content);
			const output = { sections };
			const fileId = removeForbiddenCharacters(id);

			// Make sure .data/ directiory exists
			await fs.promises.mkdir("data/", { recursive: true });

			// Write file at path
			const filePath = `data/${fileId}.json`;
			await fs.promises.writeFile(filePath, JSON.stringify(output));

			// Add meta data to internal model
			await addMetadata({
				id: id,
				kind: kind,
				numRows: totalRows,
			});
		} catch (err) {
			throw new InsightError(`addDataset threw unexpected error: ${err}`);
		}

		// Return all ids in internal model
		const result: string[] = await getIds();
		return result;
	}

	public async removeDataset(id: string): Promise<string> {
		try {
			// id validity checks
			checkId(id);

			const ids = await getIds();

			if (!ids.includes(id)) {
				throw new NotFoundError("id not found");
			}

			const fileID = removeForbiddenCharacters(id);
			await fs.remove(`data/${fileID}.json`);
			await removeMetadata(id);

			// delete InsightFacade.Sections[id];
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
