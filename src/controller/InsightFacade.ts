import { IInsightFacade, InsightDataset, InsightDatasetKind, InsightResult } from "./IInsightFacade";
import * as fs from "fs-extra";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// TODO: Remove this once you implement the methods!
		throw new Error(
			`InsightFacadeImpl::addDataset() is unimplemented! - id=${id}; content=${content?.length}; kind=${kind}`
		);
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

	public async parseZip(name: string): Promise<string> {
		// throw new Error(`InsightFacadeImpl::parseZip is unimplemented!`);
		try {
			const filePath = `test/resources/archives/${name}`;
			const buffer = await fs.readFile(filePath);
			return buffer.toString("base64");
		} catch (err) {
			throw new InsightError(`parseZip threw unexpected error: ${err}`);
		}
	}
}
