import { IInsightFacade, InsightError, InsightDataset, InsightDatasetKind, InsightResult } from "./IInsightFacade";
import * as fs from "fs-extra";
import JSZip = require("jszip");

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private ids: string[];
	private datasets: string[];

	constructor() {
		this.ids = [];
		this.datasets = []; // should we write content into json file for persistence?
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		try {
			// *******************************************************************************************************************
			// check id
			// *******************************************************************************************************************
			if (id.length === 0) {
				throw new Error("Empty id");
			}
			if (id.includes("_")) {
				throw new Error("Underscore in id");
			}
			if (/^\s*$/.test(id)) {
				throw new Error("Only whitespace in id");
			}
			this.ids.push(id);
			// *******************************************************************************************************************
			// check valid zip content
			// *******************************************************************************************************************
			const zip = new JSZip();
			const folder = await zip.loadAsync(content);

			if (!folder.folder("courses")) {
				throw new Error("zip file does not contain a 'courses' folder");
			}

			// num files == numRows
			const files = Object.keys(folder.files).filter((path) => !path.endsWith("/"));

			if (files.length === 0) {
				throw new Error("'courses' folder is empty");
			}

			// NEED TO IMPLEMENT THE InsightDataset?????? Also got to figure out persistence data structure
		} catch (err) {
			throw new InsightError(`addDataset threw unexpected error: ${err}`);
		}
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
		// TODO: Remove this once you implement the methods!
		throw new Error(`InsightFacadeImpl::listDatasets is unimplemented!`);
	}

	private async parseZip(name: string): Promise<string> {
		const filePath = `../test/resources/archives/${name}`;
		const buffer = await fs.readFile(filePath);

		const zip = new JSZip();
		const folder = await zip.loadAsync(buffer);

		if (!folder.folder("courses")) {
			throw new InsightError("parseZip threw unexpected error: zip file does not contain a 'courses' folder");
		}

		const files = Object.keys(folder.files).filter((path) => !path.endsWith("/"));

		if (files.length === 0) {
			throw new InsightError("parseZip threw unexpected error: 'courses' folder is empty");
		}

		return buffer.toString("base64");
	}
}
