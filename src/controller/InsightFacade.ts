import { IInsightFacade, InsightError, InsightDataset, InsightDatasetKind, InsightResult } from "./IInsightFacade";
import JSZip = require("jszip");

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private ids: string[];
	private datasets: InsightDataset[];

	constructor() {
		this.ids = [];
		this.datasets = []; // this just holds metadata. should we write actual contents into json file for persistence?
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		try {
			// *******************************************************************************************************************
			// check id
			// *******************************************************************************************************************
			if (id.length === 0) {
				throw new Error("empty id");
			}
			if (id.includes("_")) {
				throw new Error("underscore in id");
			}
			if (/^\s*$/.test(id)) {
				throw new Error("only whitespace in id");
			}
			this.ids.push(id);
			// *******************************************************************************************************************
			// check valid zip content (i just put parsing logic here but might want to refactor later)
			// *******************************************************************************************************************
			const zip = new JSZip();
			const folder = await zip.loadAsync(content);

			if (!folder.folder("courses")) {
				throw new Error("zip file does not contain a 'courses' folder");
			}

			const files = Object.keys(folder.files).filter((path) => !path.endsWith("/"));

			if (files.length === 0) {
				throw new Error("'courses' folder is empty");
			}
			// *******************************************************************************************************************
			// instantiate InsightDataset with metadata for current dataset, add to this.datasets
			// *******************************************************************************************************************
			const dataset: InsightDataset = {
				id: id,
				kind: kind,
				numRows: files.length,
			};
			this.datasets.push(dataset);
			// *******************************************************************************************************************
			// NEXT: Implement a actual datastructure that we put the real contents into (data structure we can query easily)
			// *******************************************************************************************************************
		} catch (err) {
			throw new InsightError(`addDataset threw unexpected error: ${err}`);
		}

		// *******************************************************************************************************************
		// return promise object that resolves into list of ids
		// *******************************************************************************************************************
		return this.ids;
	}

	public async removeDataset(id: string): Promise<string> {
		// TODO: Remove this once you implement the methods!
		throw new Error(`InsightFacadeImpl::removeDataset() is unimplemented! - id=${id};`);
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		// TODO: Remove this once you implement the methods!
		throw new Error(`InsightFacadeImpl::performQuery() is unimplemented! - query=${query};`);
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		return this.datasets;
	}
}
