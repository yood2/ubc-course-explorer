import { InsightDataset } from "./IInsightFacade";
import * as fs from "fs-extra";
import * as path from "path";

const dataDir = "data";
const metaFilePath = path.join(dataDir, "meta.json");

async function ensureDataDirectoryExists(): Promise<void> {
	await fs.ensureDir(dataDir);
}

export async function readMetadata(): Promise<InsightDataset[]> {
	await ensureDataDirectoryExists();

	if (await fs.pathExists(metaFilePath)) {
		const data = await fs.readFile(metaFilePath, "utf8");
		const json = JSON.parse(data);
		return json.meta;
	} else {
		return [];
	}
}

export async function getIds(): Promise<string[]> {
	const data = await readMetadata();
	const result: string[] = [];
	for (const d of data) {
		result.push(d.id);
	}
	return result;
}

export async function writeMetadata(data: InsightDataset[]): Promise<void> {
	await ensureDataDirectoryExists();
	const space = 2;
	await fs.writeFile(metaFilePath, JSON.stringify({ meta: data }, null, space));
}

export async function addMetadata(newData: InsightDataset): Promise<boolean> {
	const data = await readMetadata();
	data.push(newData);
	await writeMetadata(data);
	return true;
}

export async function removeMetadata(id: string): Promise<boolean> {
	let data = await readMetadata();

	data = data.filter((item) => item.id !== id);

	await writeMetadata(data);
	return true;
}
