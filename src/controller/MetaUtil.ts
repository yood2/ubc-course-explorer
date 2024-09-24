import { InsightDataset } from "./IInsightFacade";
import * as fs from "fs-extra";
import * as path from "path";

const dataDir = "data";
const metaFilePath = path.join(dataDir, "meta.json");

async function ensureDataDirectoryExists(): Promise<void> {
	try {
		await fs.ensureDir(dataDir);
	} catch (err) {
		throw new Error(`Failed to create data directory: ${(err as Error).message}`);
	}
}

export async function readMetadata(): Promise<InsightDataset[]> {
	await ensureDataDirectoryExists();

	try {
		if (await fs.pathExists(metaFilePath)) {
			const data = await fs.readFile(metaFilePath, "utf8");
			const json = JSON.parse(data);

			if (!Array.isArray(json.meta)) {
				return [];
			}
			return json.meta;
		} else {
			return [];
		}
	} catch (err) {
		throw new Error(`Error reading metadata: ${(err as Error).message}`);
	}
}

export async function getIds(): Promise<string[]> {
	try {
		const data = await readMetadata();
		const result: string[] = [];
		for (const d of data) {
			result.push(d.id);
		}
		return result;
	} catch (err) {
		throw new Error(`Error reading metadata: ${(err as Error).message}`);
	}
}

export async function removeId(id: string): Promise<boolean> {
	try {
		const metaData = await readMetadata();
		const result: InsightDataset[] = [];
		for (const meta of metaData) {
			if (meta.id !== id) {
				result.push(meta);
			}
		}
		await writeMetadata(result);
		return true;
	} catch (err) {
		throw new Error(`Error reading metadata: ${(err as Error).message}`);
	}
}

async function writeMetadata(data: InsightDataset[]): Promise<void> {
	await ensureDataDirectoryExists();

	try {
		const space = 2;
		await fs.writeFile(metaFilePath, JSON.stringify({ meta: data }, null, space));
	} catch (err) {
		throw new Error(`Error writing metadata: ${(err as Error).message}`);
	}
}

export async function addMetadata(newData: InsightDataset): Promise<boolean> {
	try {
		const data = await readMetadata();
		data.push(newData);
		await writeMetadata(data);
		return true;
	} catch (err) {
		throw new Error(`Error adding metadata: ${(err as Error).message}`);
	}
}

export async function removeMetadata(id: string): Promise<boolean> {
	try {
		let data = await readMetadata();
		const initialLength = data.length;

		// Filter out the item with the matching id
		data = data.filter((item) => item.id !== id);

		// Check if an item was actually removed
		if (data.length === initialLength) {
			return false; // No item was removed
		}

		await writeMetadata(data);
		return true; // Item was successfully removed
	} catch (err) {
		throw new Error(`Error removing metadata: ${(err as Error).message}`);
	}
}
