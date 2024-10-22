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
import { loadDataset, makeAttribute, removeForbiddenCharacters, checkKind, checkId } from "../utils/insight-utils";

/**
 * Reads and validates a given dataset.
 *
 * @param datasetID containing the dataset id
 * @throws Error if JSON file is not a valid dataset.
 */

export default class InsightFacade implements IInsightFacade {
	// public static Sections: Record<string, Section[]> = {};

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		try {
			checkId(id);
			const ids = await getIds();
			if (ids.includes(id)) {
				throw new InsightError("Id already exists");
			}

			checkKind(kind);

			const { sections, totalRows } = await processZipContent(content);

			const output = { sections };

			const fileID = removeForbiddenCharacters(id);
			await fs.promises.mkdir("data/", { recursive: true });
			const filePath = `data/${fileID}.json`;
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
